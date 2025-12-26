import { PrismaClient } from '.prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Crear usuario SUPER_ADMIN
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@cursos.com' },
    update: {},
    create: {
      email: 'admin@cursos.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Sistema',
      role: 'SUPER_ADMIN',
      emailVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Super Admin creado:', superAdmin.email);

  // Crear usuario OWNER (cliente/profesor)
  const owner = await prisma.user.upsert({
    where: { email: 'owner@cursos.com' },
    update: {},
    create: {
      email: 'owner@cursos.com',
      password: hashedPassword,
      firstName: 'María Victoria',
      lastName: 'Seoane',
      role: 'OWNER',
      emailVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Owner creado:', owner.email);

  // Crear Feature Toggles por defecto
  const featureToggles = [
    {
      key: 'birthday_email',
      isEnabled: true,
      description: 'Envío de emails de cumpleaños',
    },
    {
      key: 'cart_abandoned_email',
      isEnabled: true,
      description: 'Emails de carrito abandonado',
    },
    {
      key: 'welcome_email',
      isEnabled: true,
      description: 'Email de bienvenida al registrarse',
    },
    {
      key: 'reviews_visible',
      isEnabled: true,
      description: 'Mostrar reseñas en el sitio',
    },
    {
      key: 'coupons_enabled',
      isEnabled: true,
      description: 'Sistema de cupones activo',
    },
    {
      key: 'google_login',
      isEnabled: true,
      description: 'Login con Google OAuth',
    },
    {
      key: 'registration_enabled',
      isEnabled: true,
      description: 'Permitir registro de usuarios',
    },
  ];

  for (const toggle of featureToggles) {
    await prisma.featureToggle.upsert({
      where: { key: toggle.key },
      update: { isEnabled: toggle.isEnabled, description: toggle.description },
      create: toggle,
    });
  }

  console.log('✅ Feature toggles creados');

  // Crear configuraciones del sitio por defecto
  const siteConfigs = [
    {
      key: 'site_name',
      value: { name: 'Cursos Online' },
      description: 'Nombre del sitio',
    },
    {
      key: 'contact_email',
      value: { email: 'contacto@cursos.com' },
      description: 'Email de contacto',
    },
    {
      key: 'social_links',
      value: { instagram: '', facebook: '', youtube: '' },
      description: 'Redes sociales',
    },
    {
      key: 'seo',
      value: {
        title: 'Cursos Online',
        description: 'Plataforma de cursos online',
      },
      description: 'Configuración SEO',
    },
  ];

  for (const config of siteConfigs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: { value: config.value, description: config.description },
      create: config,
    });
  }

  console.log('✅ Site configs creados');

  // Crear categoría de ejemplo
  const category = await prisma.category.upsert({
    where: { slug: 'desarrollo-personal' },
    update: {},
    create: {
      name: 'Desarrollo Personal',
      slug: 'desarrollo-personal',
      description: 'Cursos para el crecimiento personal y profesional',
      order: 1,
    },
  });

  console.log('✅ Categoría de ejemplo creada');

  // Crear curso de ejemplo
  const course = await prisma.course.upsert({
    where: { slug: 'curso-ejemplo' },
    update: {},
    create: {
      title: 'Curso de Ejemplo',
      slug: 'curso-ejemplo',
      shortDescription: 'Este es un curso de ejemplo para probar el sistema.',
      longDescription:
        'Descripción larga del curso de ejemplo. Aquí va toda la información detallada sobre el contenido del curso, lo que aprenderás, requisitos, etc.',
      price: 15000,
      discountPrice: 12000,
      level: 'Principiante',
      language: 'Español',
      isPublished: false,
      isFeatured: false,
    },
  });

  // Vincular curso con categoría
  await prisma.courseCategory.upsert({
    where: {
      courseId_categoryId: {
        courseId: course.id,
        categoryId: category.id,
      },
    },
    update: {},
    create: {
      courseId: course.id,
      categoryId: category.id,
    },
  });

  // Crear módulo de ejemplo
  const module = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Módulo 1: Introducción',
      description: 'Introducción al curso',
      order: 1,
    },
  });

  // Crear lecciones de ejemplo
  await prisma.lesson.createMany({
    data: [
      {
        moduleId: module.id,
        title: 'Lección 1: Bienvenida',
        description: 'Bienvenida al curso',
        order: 1,
        isFree: true,
        duration: 5,
      },
      {
        moduleId: module.id,
        title: 'Lección 2: Primeros pasos',
        description: 'Primeros pasos en el curso',
        order: 2,
        isFree: false,
        duration: 15,
      },
    ],
  });

  console.log('✅ Curso de ejemplo creado con módulos y lecciones');

  console.log('✨ Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

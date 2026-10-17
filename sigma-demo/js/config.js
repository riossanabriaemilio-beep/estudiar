/*
  SIGMA — configuración de la web demo.
  Todo lo que se ve en pantalla sale de acá: textos, links, sabores,
  datos nutricionales y contacto. Cambiá los valores y recargá la página.

  Regla: si un dato no está confirmado por la marca, va como null.
  Lo que es null NO se muestra en pantalla (no se inventa nada).
*/
window.SIGMA_CONFIG = {
  marca: {
    nombre: "SIGMA",
    instagram: "https://www.instagram.com/sigmafood.ar/",
    instagramUsuario: "@sigmafood.ar",
    email: "nutritivitasigma@gmail.com",
    whatsapp: null, // [PENDIENTE] número de la marca, formato internacional sin "+" ni espacios. Ej: "5491112345678"
    frase: "El problema no era tu disciplina. Era la falta de opciones.",
  },

  aviso: "Propuesta de diseño para Sigma — no es el sitio oficial",

  // En collabs.html los "#..." apuntan a index.html automáticamente
  nav: [
    { texto: "Productos", href: "#sabores" },
    { texto: "Qué tiene", href: "#que-tiene" },
    { texto: "Dónde comprar", href: "#donde-comprar" },
    { texto: "Mayoristas", href: "#mayoristas" },
    { texto: "Collabs", href: "collabs.html" },
  ],

  inicio: {
    titulo: ["El problema no era tu disciplina.", "Era la falta de opciones."],
    subtitulo: "Alfajor con 15 g de proteína. Manteca de maní, whey, miel y chocolate.",
    botonPrincipal: { texto: "Dónde comprar", href: "#donde-comprar" },
    botonSecundario: { texto: "Quiero venderlo", href: "#mayoristas" },
    etiquetas3d: ["15 g de proteína", "Manteca de maní", "Whey", "Miel y chocolate"],
  },

  sabores: [
    {
      id: "chocolate",
      nombre: "Chocolate",
      bajada: "Baño de chocolate y relleno de manteca de maní.",
      imagen: "img/render-chocolate.webp",
      alt: "Render 3D de un alfajor bañado en chocolate",
      boton: { texto: "Comprar Chocolate", href: "#donde-comprar" },
    },
    {
      id: "blanco",
      nombre: "Blanco",
      bajada: "Baño blanco y relleno de manteca de maní.",
      imagen: "img/render-blanco.webp",
      alt: "Render 3D de un alfajor con baño blanco",
      boton: { texto: "Comprar Blanco", href: "#donde-comprar" },
    },
  ],

  // Segundo producto: snack proteico (datos tomados del envase)
  snack: {
    id: "snack",
    nombre: "Snack proteico",
    sabor: "Queso parmesano",
    bajada: "Arroz + whey, sabor queso parmesano.",
    datos: ["15 g de proteína por paquete", "Fuente de fibra", "Sin gluten"],
    peso: null, // [PENDIENTE] peso neto del paquete (no se lee bien en la foto)
    imagen: "img/snack.webp",
    alt: "Paquete de Snack proteico Sigma de arroz y whey, sabor queso parmesano, con 15 g de proteína por paquete",
    // [PENDIENTE] link de compra del snack. Mientras tanto, consulta por Instagram.
    boton: { texto: "Consultar por Instagram", href: "https://ig.me/m/sigmafood.ar" },
  },

  nutricion: {
    porcion: "Por unidad (63 g)",
    // Solo se muestran las filas con valor. Completar con los datos del envase.
    filas: [
      { nombre: "Valor energético", valor: null }, // [PENDIENTE] ej: "000 kcal"
      { nombre: "Carbohidratos", valor: null },    // [PENDIENTE]
      { nombre: "Proteínas", valor: "15 g", destacado: true },
      { nombre: "Grasas totales", valor: null },   // [PENDIENTE]
      { nombre: "Grasas saturadas", valor: null, sangria: true }, // [PENDIENTE]
      { nombre: "Grasas trans", valor: null, sangria: true },     // [PENDIENTE]
      { nombre: "Fibra alimentaria", valor: null }, // [PENDIENTE]
      { nombre: "Sodio", valor: null },             // [PENDIENTE]
    ],
    ingredientes: [
      { nombre: "Manteca de maní", detalle: "El relleno." },
      { nombre: "Whey", detalle: "Proteína de suero de leche." },
      { nombre: "Miel", detalle: "En la mezcla." },
      { nombre: "Chocolate", detalle: "El baño, negro o blanco." },
    ],
    nota: "Tabla completa e ingredientes en el envase.",
  },

  momentos: {
    titulo: "Cuándo comerlo",
    items: [
      {
        titulo: "Después de entrenar",
        texto: "Terminás la rutina y tenés 15 g de proteína a mano. Sin licuadora, sin shaker.",
      },
      {
        titulo: "A la merienda",
        texto: "El alfajor de siempre, pero con algo que suma. Con un café o con un mate.",
      },
      {
        titulo: "En la mochila o en la oficina",
        texto: "Pesa 63 g y entra en cualquier lado: el bolso, la mochila, el cajón del escritorio.",
      },
    ],
    imagen: "img/gimnasio.webp",
    alt: "Alfajor Sigma asomando de una riñonera azul en un gimnasio, con discos de pesas de fondo",
  },

  tiendas: [
    {
      nombre: "Farmacity",
      detalle: "Comprá online o buscalo en Farmacity.",
      url: "https://www.farmacity.com/alfajor-proteico-sigma-x-63-g/p",
      boton: "Comprar en Farmacity",
    },
    {
      nombre: "Mercado Libre",
      detalle: "Caja de 12 unidades, sabor chocolate.",
      url: "https://articulo.mercadolibre.com.ar/MLA-1694577861-alfajor-sigma-con-proteina-chocolate-63g-caja-x-12un-_JM",
      boton: "Comprar en Mercado Libre",
    },
    {
      nombre: "The Food Market",
      detalle: "Tienda online de alimentos.",
      url: "https://www.thefoodmarket.com.ar/sigma?_q=SIGMA&map=ft",
      boton: "Comprar en The Food Market",
    },
  ],
  tiendasImagen: {
    src: "img/farmacity.webp",
    alt: "Alfajor Sigma frente a una sucursal de Farmacity",
  },

  mayoristas: {
    titulo: "Vendelo en tu negocio",
    texto: "Para gimnasios, kioscos, dietéticas y distribuidores. Contanos qué necesitás y te respondemos por mail.",
    tiposNegocio: ["Gimnasio", "Kiosco", "Dietética", "Distribuidor", "Otro"],
    asuntoMail: "Pedido mayorista — Alfajor Sigma",
    imagen: "img/caja.webp",
    alt: "Caja exhibidora de Sigma con 12 alfajores proteicos",
  },

  comunidad: {
    titulo: "Comunidad",
    texto: "Eventos fitness y colaboraciones con creadores. Lo que pasa, lo subimos a Instagram.",
    bloques: [
      { titulo: "Eventos fitness", texto: "Estamos en eventos de entrenamiento. Mirá los últimos en las destacadas." },
      { titulo: "Collabs", texto: "Trabajamos con creadores. Si hacés contenido fitness, escribinos." },
    ],
    fotos: [
      { src: "img/maquina.webp", alt: "Máquina de peluches azul llena de alfajores Sigma" },
      { src: "img/balanza.webp", alt: "Balanza azul: de un lado un alfajor Sigma, del otro whey, chocolate y pasta de maní" },
      { src: "img/caja.webp", alt: "Caja exhibidora de Sigma con 12 alfajores" },
      { src: "img/gimnasio.webp", alt: "Alfajor Sigma en una riñonera en el gimnasio" },
    ],
  },

  faq: [
    {
      p: "¿Cuánta proteína tiene?",
      r: "15 g de proteína por unidad de 63 g.",
    },
    {
      p: "¿Qué tiene adentro?",
      r: "Manteca de maní, whey, miel y chocolate. La lista completa de ingredientes está en el envase.",
    },
    {
      p: "¿El snack es sin gluten?",
      r: "Sí, el envase del Snack proteico sabor queso parmesano dice sin gluten.",
    },
    {
      p: "¿Dónde lo compro?",
      r: "En Farmacity, en Mercado Libre y en The Food Market. Tenés los links en la sección Dónde comprar.",
    },
    {
      p: "¿Venden por mayor?",
      r: "Sí. Completá el formulario de Mayoristas o escribinos a nutritivitasigma@gmail.com.",
    },
    {
      p: "¿Hacen colaboraciones?",
      r: "Sí. Buscamos perfiles del mundo fitness, nutrición y vida activa. Mandanos un DM a @sigmafood.ar y te enviamos toda la info.",
    },
  ],

  // Página collabs.html (textos de la historia destacada "Collabs" de Instagram)
  collabs: {
    titulo: "¿Querés colaborar con nosotros?",
    puntos: [
      "Buscamos perfiles del mundo fitness, nutrición y vida activa.",
      "Mandanos un DM y te enviamos toda la info.",
    ],
    dm: "https://ig.me/m/sigmafood.ar",
    creadores: [
      {
        // [CONFIRMAR] usuario tomado del texto del posteo ("Dale doiverpichhh, dejá un alfajor para el resto")
        usuario: "@doiverpichhh",
        url: "https://www.instagram.com/doiverpichhh/",
        video: "video/collab-sigma.mp4",
        videoWebm: "video/collab-sigma.webm",
        poster: "img/collab-poster.webp",
        texto: "Lo probó en el gimnasio. 15 g de proteína, sabor chocolate. Su veredicto: muy rico.",
      },
      // Para sumar otro creador, copiá el bloque de arriba y cambiá los datos.
    ],
  },

  firma: {
    texto: "Propuesta de diseño por Emilio",
    whatsapp: null, // [PENDIENTE] tu número, formato internacional sin "+". Ej: "5491112345678"
  },
};

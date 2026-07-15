export type SesionesOnlineAccordionItem = {
  title: string;
  href: string;
  bullets: string[];
  footer?: string;
};

export const SESIONES_ONLINE_INFO_ACCORDION: SesionesOnlineAccordionItem[] = [
  {
    title: "¿Qué haremos en una terapia online?",
    href: "https://esitef.com/que-haremos-en-una-terapia-online/",
    bullets: [
      "Te escucharé y atenderé todos los detalles que tengas para contarme sobre lo que te ocurre.",
      "Si ya has visitado otros profesionales, revisaremos tu diagnóstico y tratamiento, explicándote lo que te han hecho y dicho, y analizaremos si tomar otros caminos.",
      "Haremos una evaluación funcional (a través de posturas y movimiento que te pediré) que nos ayude a identificar el origen de tu problema.",
      "En base a eso, podré explicarte y podrás entender qué tienes y buscaremos el mejor camino para resolverlo.",
      "Te propondré un plan de acción específico para ti. Practicaremos las herramientas terapéuticas fundamentales que te van a servir.",
      "Compartiré contigo links e información que te ayuden a entender y profundizar más en el entendimiento de tu caso.",
    ],
    footer:
      "Tras la sesión recibirás un informe con los puntos clave y videos para el seguimiento de tu plan. Podrás enviar un mail posterior con dudas que quieras aclarar.",
  },
  {
    title: "¿Qué es coaching de movimiento?",
    href: "https://esitef.com/coaching-de-movimiento/",
    bullets: [
      "Analizamos y corregimos las alteraciones de tus movimientos que pueden ser origen de una lesión futura o ya existente.",
      "Valoramos tu capacidad de movimiento a través de tests dinámicos para entender fortalezas y debilidades, y programamos actividades que mejoren tus patrones funcionales.",
      "El objetivo es optimizar la calidad de tus movimientos y enseñarte a moverte eficientemente, para sacar tu máximo potencial.",
      "No creemos en esperar a estar lesionado para tratarte: creamos estrategias específicas para prevenir lesiones.",
      "Queremos que tu cuerpo funcione integradamente como una unidad, de forma coordinada y equilibrada.",
    ],
    footer:
      "Movement coaching es beneficioso para todo el mundo y todos los niveles de exigencia.",
  },
];

export type SesionesOnlineFaqItem = { question: string; answer: string };

export const SESIONES_ONLINE_FAQ: SesionesOnlineFaqItem[] = [
  {
    question: "¿Cuánto tiempo es la sesión?",
    answer:
      "Estaremos trabajando de forma exclusiva contigo durante 1 hora y 15 minutos.",
  },
  {
    question: "¿Qué incluye el servicio?",
    answer:
      "La sesión online, el envío previo de tu historia con pruebas complementarias para su análisis, la sesión cara a cara con Tomás y la posibilidad de enviar un mail posterior con dudas a aclarar.",
  },
  {
    question: "¿Cuánto vale la sesión?",
    answer:
      "90 USD. Dado que el pago es con tarjeta de crédito, se cobra de manera automática en tu moneda local.",
  },
  {
    question: "¿De dónde es la hora que aparece en las reservas?",
    answer:
      "La hora que aparece en las reservas es de España. Si eres de otro país, calcula la diferencia horaria para una mejor organización.",
  },
  {
    question: "¿Por qué vía se realizan las sesiones?",
    answer:
      "Nos adaptamos a lo que te resulte más cómodo: Skype, Zoom, WhatsApp video u otra plataforma que indiques al confirmar la reserva.",
  },
  {
    question: "¿Puedo enviar radiografías, resonancias o informes médicos?",
    answer:
      "Sí. Podrás enviarlos respondiendo al mail que te enviaremos 24 horas antes de la sesión para que Tomás ya haya revisado tu caso.",
  },
  {
    question: "¿Cómo tiene que ser el lugar donde esté en el momento de la sesión?",
    answer:
      "Preferiblemente que haya, frente a la cámara, un espacio para hacer algunos movimientos, tirarse al suelo o moverte sin incomodidades.",
  },
  {
    question: "¿Qué tengo que vestir?",
    answer:
      "Ropa cómoda y no difícil de quitar en caso de que se requiera ver alguna parte del cuerpo o hacer movimientos.",
  },
  {
    question: "¿Cuándo y cómo hago el pago?",
    answer:
      "Tras reservar tu hora en el calendario, completarás tus datos y el pago se hará con tarjeta de crédito en el momento de la reserva.",
  },
  {
    question: "¿Qué ocurre si, tras reservar, no puedo asistir?",
    answer:
      "Si avisas antes de las 72 horas previas a la sesión, se podrá reagendar sin coste. Dentro de las 72 horas previas no hay devolución ni cambios posibles.",
  },
  {
    question: "¿Podré obtener una factura?",
    answer:
      "Sí. Tras la sesión puedes enviarnos tus datos de facturación a info@esitef.com.",
  },
];

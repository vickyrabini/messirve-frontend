import Link from 'next/link'

export const metadata = {
  title: 'Términos y Privacidad — Messirve',
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <h3 className="text-base font-semibold text-gray-900 mt-8 mb-2">
      {number}. {title}
    </h3>
  )
}

function SubsectionTitle({ title }: { title: string }) {
  return <h4 className="text-sm font-semibold text-gray-800 mt-5 mb-1">{title}</h4>
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 leading-relaxed mb-3">{children}</p>
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-outside pl-5 mb-3 space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-gray-600 leading-relaxed">
          {item}
        </li>
      ))}
    </ul>
  )
}

function Divider() {
  return <hr className="my-10 border-gray-200" />
}

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-5 py-12">
        {/* Back link */}
        <Link href="/" className="text-sm hover:underline mb-8 inline-block" style={{ color: '#72B8E6' }}>
          ← Volver
        </Link>

        {/* ── TÉRMINOS Y CONDICIONES ── */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">TÉRMINOS Y CONDICIONES DE USO</h1>
          <p className="text-sm text-gray-500">MESSIRVE — Servicios de y para argentinos y uruguayos en España</p>
          <p className="text-sm text-gray-500">Última actualización: 04 de octubre de 2025</p>
        </div>

        <SectionTitle number="1" title="Aceptación de los Términos" />
        <P>
          {`Al descargar, registrarte o utilizar la aplicación MESSIRVE (en adelante, "la App" o "la Plataforma"),
          aceptás íntegramente estos Términos y Condiciones de Uso (en adelante, "los Términos"), así como nuestra
          Política de Privacidad. Estos Términos constituyen un contrato legalmente vinculante entre vos y MESSIRVE.`}
        </P>
        <P>
          Si accedés a la App en nombre de una empresa u organización, declarás tener autorización para vincular a
          dicha entidad a estos Términos.
        </P>
        <P>
          Si no estás de acuerdo con alguna parte de estos Términos, no debés usar la App. El uso continuado de la
          Plataforma implica la aceptación de cualquier modificación futura que sea debidamente notificada.
        </P>

        <SectionTitle number="2" title="Descripción del Servicio" />
        <P>MESSIRVE es una plataforma digital que actúa como directorio y marketplace de conexión entre:</P>
        <Ul
          items={[
            'Usuarios (Clientes): personas que buscan servicios ofrecidos por emprendedores argentinos y uruguayos radicados en España.',
            'Prestadores de Servicio: emprendedores y profesionales argentinos o uruguayos que ofrecen sus servicios en España, ya sea de forma presencial o remota.',
          ]}
        />
        <P>
          MESSIRVE actúa exclusivamente como intermediario tecnológico. No prestamos los servicios anunciados, no
          somos parte de los contratos entre usuarios y prestadores, y no garantizamos la calidad, seguridad,
          legalidad ni idoneidad de los servicios ofrecidos a través de la Plataforma.
        </P>

        <SectionTitle number="3" title="Registro y Cuentas de Usuario" />
        <SubsectionTitle title="3.1 Requisitos generales" />
        <P>
          Para usar la App debés tener al menos 18 años de edad. Al registrarte, declarás que la información
          proporcionada es veraz, completa y actualizada. Sos responsable de mantener la confidencialidad de tu
          contraseña y de todas las actividades que ocurran bajo tu cuenta.
        </P>
        <SubsectionTitle title="3.2 Registro como Cliente (Usuario)" />
        <P>Para registrarte como cliente debés proporcionar:</P>
        <Ul items={['Nombre completo', 'Dirección de correo electrónico válida', 'Contraseña segura']} />
        <P>El acceso como cliente es completamente gratuito.</P>
        <SubsectionTitle title="3.3 Registro como Prestador de Servicio" />
        <P>Para registrarte como prestador debés proporcionar:</P>
        <Ul
          items={[
            'Nombre completo y/o nombre comercial o de marca',
            'Logotipo o imagen representativa del negocio',
            'Descripción detallada del servicio ofrecido',
            'Datos de contacto: número de WhatsApp y/o cuenta de Instagram',
            'Ciudad o zona de operación en España',
            'Categoría del servicio',
          ]}
        />
        <P>
          Toda la información publicada debe ser veraz. MESSIRVE se reserva el derecho de eliminar perfiles que
          contengan información falsa o engañosa.
        </P>

        <SectionTitle number="4" title="Modelo de Precios y Suscripciones" />
        <SubsectionTitle title="4.1 Clientes" />
        <P>
          El acceso y uso de la App como cliente es completamente gratuito, sin cargos ocultos ni comisiones sobre
          los servicios contratados.
        </P>
        <SubsectionTitle title="4.2 Prestadores de Servicio" />
        <P>
          Los prestadores deben suscribirse a un plan mensual de pago para aparecer en los resultados de búsqueda de
          la Plataforma. El precio de la suscripción es de 18 euros (EUR) mensuales, salvo modificación debidamente
          notificada.
        </P>
        <P>
          El cobro se realiza mediante débito automático a través de Stripe, plataforma de pagos certificada PCI DSS.
          Al suscribirte, autorizás el cargo recurrente mensual hasta que canceles la suscripción.
        </P>
        <SubsectionTitle title="4.3 Cancelación" />
        <P>
          Podés cancelar tu suscripción en cualquier momento desde la sección Ajustes &gt; Suscripción de la App,
          sin penalización. La cancelación tiene efecto al finalizar el período mensual en curso. No se emiten
          reembolsos por períodos parciales ya facturados, salvo lo establecido en la normativa aplicable.
        </P>
        <SubsectionTitle title="4.4 Derecho de desistimiento (Unión Europea)" />
        <P>
          De conformidad con el Real Decreto Legislativo 1/2007 y la Directiva 2011/83/UE, los consumidores
          residentes en la Unión Europea tienen derecho a desistir del contrato en un plazo de 14 días naturales
          desde la contratación del servicio, sin necesidad de justificación. Para ejercer este derecho, debés
          comunicarlo a messirve.barna@gmail.com dentro del plazo indicado.
        </P>

        <SectionTitle number="5" title="Uso Aceptable de la Plataforma" />
        <P>Al usar MESSIRVE, te comprometés a no:</P>
        <Ul
          items={[
            'Publicar información falsa, incompleta o engañosa sobre vos mismo o tus servicios.',
            'Utilizar la Plataforma para cometer fraudes, estafas o cualquier actividad ilegal.',
            'Publicar contenido ofensivo, discriminatorio, difamatorio, amenazante o que incite al odio.',
            'Suplantar la identidad de otra persona o entidad.',
            'Intentar acceder de forma no autorizada a cuentas de otros usuarios o a los sistemas de MESSIRVE.',
            'Introducir virus, malware u otro código dañino en la Plataforma.',
            'Hacer scraping, minería de datos u otra extracción automatizada de contenido sin autorización expresa.',
            'Usar la App con fines publicitarios no autorizados o para envíos masivos no solicitados (spam).',
          ]}
        />
        <P>
          MESSIRVE se reserva el derecho de suspender o eliminar sin previo aviso cuentas que incumplan estas normas,
          sin perjuicio de las acciones legales que pudieran corresponder.
        </P>

        <SectionTitle number="6" title="Reseñas y Valoraciones" />
        <P>
          La Plataforma permite a los clientes dejar reseñas y valoraciones sobre los servicios contratados. Al
          publicar una reseña:
        </P>
        <Ul
          items={[
            'Declarás que refleja tu experiencia honesta y personal.',
            'No podés publicar reseñas falsas, incentivadas económicamente o sobre servicios que no hayas utilizado.',
            'Las reseñas no pueden contener información personal de terceros, lenguaje ofensivo ni contenido ilegal.',
          ]}
        />
        <P>
          MESSIRVE se reserva el derecho de moderar, editar o eliminar reseñas que incumplan estas normas, pero no
          está obligada a hacerlo. La existencia de una reseña no implica que MESSIRVE la avale ni la valide.
        </P>

        <SectionTitle number="7" title="Responsabilidad y Limitación de Garantías" />
        <SubsectionTitle title="7.1 Alcance de la intermediación" />
        <P>
          MESSIRVE es un intermediario tecnológico. No somos parte en las transacciones entre usuarios y prestadores,
          no supervisamos la calidad de los servicios ni verificamos la totalidad de las credenciales o habilitaciones
          de los prestadores. Cualquier contrato de servicio se celebra directamente entre el cliente y el prestador.
        </P>
        <SubsectionTitle title="7.2 Verificación de identidad" />
        <P>
          MESSIRVE realiza verificaciones básicas de identidad de los prestadores al momento del registro, pero no
          garantiza la exactitud, veracidad ni vigencia de la información proporcionada. La contratación de servicios
          es responsabilidad del usuario.
        </P>
        <SubsectionTitle title="7.3 Limitación de responsabilidad" />
        <P>En la máxima medida permitida por la ley aplicable, MESSIRVE no será responsable por:</P>
        <Ul
          items={[
            'Daños directos, indirectos, incidentales o consecuentes derivados del uso o imposibilidad de uso de la App.',
            'La calidad, seguridad o resultado de los servicios contratados a través de la Plataforma.',
            'Disputas entre usuarios y prestadores.',
            'Interrupciones del servicio por mantenimiento, fallos técnicos o causas de fuerza mayor.',
          ]}
        />
        <P>
          Esta limitación no afecta los derechos que como consumidor te corresponden bajo la legislación española y
          europea vigente.
        </P>

        <SectionTitle number="8" title="Propiedad Intelectual" />
        <P>
          Todos los derechos de propiedad intelectual sobre la App, su diseño, logotipos, nombre comercial, código
          fuente, textos y demás contenidos son propiedad exclusiva de MESSIRVE o sus licenciantes. Queda prohibida
          su reproducción, distribución o uso sin autorización expresa.
        </P>
        <P>
          Al publicar contenido en la Plataforma (fotografías, descripciones, etc.), otorgás a MESSIRVE una licencia
          no exclusiva, gratuita y mundial para usar, mostrar y distribuir dicho contenido dentro de la App y en sus
          comunicaciones de marketing, manteniendo vos la titularidad del mismo.
        </P>

        <SectionTitle number="9" title="Modificaciones y Disponibilidad del Servicio" />
        <P>
          MESSIRVE se reserva el derecho de modificar, suspender o discontinuar, temporal o permanentemente, la App
          o cualquiera de sus funcionalidades, con o sin previo aviso. No seremos responsables ante vos ni ante
          terceros por dichas modificaciones.
        </P>
        <P>
          Ante cambios sustanciales en estos Términos, notificaremos a los usuarios con al menos 30 días de
          anticipación por correo electrónico o mediante aviso destacado en la App.
        </P>

        <SectionTitle number="10" title="Baja de Cuenta" />
        <P>
          Podés eliminar tu cuenta en cualquier momento desde Ajustes &gt; Eliminar cuenta. La eliminación de la
          cuenta implica la pérdida de acceso a la Plataforma y la eliminación de tus datos, de acuerdo con lo
          establecido en nuestra Política de Privacidad y los plazos de retención legales aplicables.
        </P>
        <P>
          MESSIRVE puede suspender o eliminar cuentas que incumplan estos Términos, con o sin previo aviso
          dependiendo de la gravedad de la infracción.
        </P>

        <SectionTitle number="11" title="Legislación Aplicable y Resolución de Disputas" />
        <P>Estos Términos se rigen por la legislación española vigente, en particular:</P>
        <Ul
          items={[
            'Ley 34/2002, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSICE)',
            'Real Decreto Legislativo 1/2007, de Defensa de los Consumidores y Usuarios',
            'Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD)',
            'Reglamento (UE) 2016/679, General de Protección de Datos (RGPD)',
          ]}
        />
        <P>
          Para la resolución de cualquier controversia derivada de estos Términos, las partes acuerdan someterse a la
          jurisdicción de los juzgados y tribunales de la ciudad de Barcelona, con renuncia expresa a cualquier otro
          fuero que pudiera corresponderles, sin perjuicio de los fueros imperativos que la legislación de
          consumidores establezca en beneficio del usuario.
        </P>
        <P>
          La Comisión Europea ofrece una plataforma de resolución de litigios en línea (ODR) disponible en:{' '}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: '#72B8E6' }}
          >
            https://ec.europa.eu/consumers/odr
          </a>
        </P>

        <SectionTitle number="12" title="Contacto" />
        <P>Para cualquier consulta o reclamación relacionada con estos Términos:</P>
        <Ul items={['Email: messirve.barna@gmail.com', 'WhatsApp: +34 603 848 988']} />

        <Divider />

        {/* ── POLÍTICA DE PRIVACIDAD ── */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">POLÍTICA DE PRIVACIDAD</h2>
          <p className="text-sm text-gray-500">MESSIRVE — Servicios de y para argentinos y uruguayos en España</p>
          <p className="text-sm text-gray-500">Última actualización: 04 de octubre de 2025</p>
        </div>

        <SectionTitle number="1" title="Responsable del Tratamiento" />
        <P>
          El responsable del tratamiento de los datos personales recogidos a través de la App MESSIRVE es:
        </P>
        <Ul
          items={[
            'Denominación: MESSIRVE',
            'Email de contacto: messirve.barna@gmail.com',
            'Teléfono: +34 603 848 988',
          ]}
        />
        <P>
          Para ejercer tus derechos en materia de protección de datos o para cualquier consulta relacionada con el
          tratamiento de tu información personal, podés contactarnos en la dirección indicada.
        </P>

        <SectionTitle number="2" title="Marco Legal Aplicable" />
        <P>Esta Política de Privacidad se elabora en cumplimiento de:</P>
        <Ul
          items={[
            'Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo (RGPD), de aplicación directa en España.',
            'Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).',
            'Ley 34/2002, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSICE), en lo relativo a comunicaciones comerciales.',
          ]}
        />

        <SectionTitle number="3" title="Datos Personales que Recopilamos" />
        <SubsectionTitle title="3.1 Datos proporcionados directamente por el usuario" />
        <P>Al registrarte y usar la App, podemos recopilar:</P>
        <Ul
          items={[
            'Nombre completo y/o nombre comercial',
            'Dirección de correo electrónico',
            'Número de teléfono (WhatsApp)',
            'País y ciudad de residencia',
            'Fotografías o imágenes de perfil y del negocio',
            'Descripción de servicios y categoría profesional',
            'Datos de pago (gestionados exclusivamente por Stripe; MESSIRVE no almacena datos de tarjetas)',
          ]}
        />
        <SubsectionTitle title="3.2 Datos generados por el uso de la App" />
        <P>De forma automática, la App puede recopilar:</P>
        <Ul
          items={[
            'Datos de navegación y uso (páginas visitadas, funciones utilizadas, tiempo de sesión)',
            'Dirección IP y datos del dispositivo (sistema operativo, tipo de navegador)',
            'Datos de geolocalización aproximada (si otorgás permiso)',
            'Registros de actividad (reseñas publicadas, mensajes enviados)',
          ]}
        />

        <SectionTitle number="4" title="Finalidad y Base Jurídica del Tratamiento" />
        <P>Tratamos tus datos personales para las siguientes finalidades:</P>
        <Ul
          items={[
            'Gestión de la cuenta y prestación del servicio — Base jurídica: ejecución del contrato (Art. 6.1.b RGPD). Permite crear y gestionar tu perfil, conectar usuarios con prestadores y procesar pagos.',
            'Comunicaciones relacionadas con el servicio — Base jurídica: ejecución del contrato (Art. 6.1.b RGPD). Incluye notificaciones sobre tu cuenta, actualizaciones del servicio y respuestas a consultas.',
            'Comunicaciones comerciales y marketing — Base jurídica: consentimiento (Art. 6.1.a RGPD). Solo si nos lo autorizás expresamente. Podés retirar tu consentimiento en cualquier momento sin que ello afecte la legalidad del tratamiento previo.',
            'Seguridad y prevención del fraude — Base jurídica: interés legítimo (Art. 6.1.f RGPD). Para detectar y prevenir actividades fraudulentas, abusivas o ilegales en la Plataforma.',
            'Cumplimiento de obligaciones legales — Base jurídica: obligación legal (Art. 6.1.c RGPD). Para cumplir con requerimientos fiscales, legales o regulatorios aplicables.',
          ]}
        />

        <SectionTitle number="5" title="Destinatarios de los Datos" />
        <P>
          MESSIRVE no vende ni cede tus datos personales a terceros con fines comerciales. Podemos compartir datos en
          los siguientes casos:
        </P>
        <Ul
          items={[
            'Entre usuarios y prestadores: compartimos los datos de contacto estrictamente necesarios para coordinar la prestación del servicio (por ejemplo, el número de WhatsApp del prestador se muestra al cliente interesado).',
            'Proveedores de servicios tecnológicos: empresas que nos asisten en la operación de la App (hosting, procesamiento de pagos mediante Stripe, analítica), bajo contratos que garantizan el cumplimiento del RGPD.',
            'Autoridades competentes: cuando exista obligación legal o requerimiento judicial.',
          ]}
        />
        <P>
          En caso de transferencias internacionales de datos fuera del Espacio Económico Europeo, nos aseguramos de
          que se cuente con las garantías adecuadas exigidas por el RGPD (cláusulas contractuales tipo, decisiones de
          adecuación, etc.).
        </P>

        <SectionTitle number="6" title="Conservación de los Datos" />
        <P>Conservamos tus datos personales durante el tiempo necesario para:</P>
        <Ul
          items={[
            'Mantener activa tu cuenta y prestarte el servicio.',
            'Cumplir con obligaciones legales aplicables (por ejemplo, la legislación fiscal española exige conservar datos de facturación durante 5 años).',
            'Atender posibles reclamaciones o responsabilidades legales.',
          ]}
        />
        <P>
          Una vez eliminada tu cuenta, procederemos a suprimir o anonimizar tus datos en un plazo máximo de 30 días,
          salvo que exista obligación legal de conservarlos por un período mayor.
        </P>

        <SectionTitle number="7" title="Tus Derechos" />
        <P>De conformidad con el RGPD y la LOPDGDD, tenés derecho a:</P>
        <Ul
          items={[
            'Acceso: obtener confirmación sobre si tratamos tus datos y acceder a ellos.',
            'Rectificación: solicitar la corrección de datos inexactos o incompletos.',
            'Supresión ("derecho al olvido"): solicitar la eliminación de tus datos cuando ya no sean necesarios para la finalidad con que fueron recogidos.',
            'Oposición: oponerte al tratamiento basado en interés legítimo o con fines de marketing.',
            'Limitación del tratamiento: solicitar que suspendamos temporalmente el tratamiento de tus datos.',
            'Portabilidad: recibir tus datos en formato estructurado y de uso común para transmitirlos a otro responsable.',
            'Retirar el consentimiento: en cualquier momento, sin efecto retroactivo, cuando el tratamiento se base en tu consentimiento.',
          ]}
        />
        <P>
          Para ejercer cualquiera de estos derechos, escribinos a messirve.barna@gmail.com indicando tu nombre,
          dirección de email y el derecho que deseás ejercer. Responderemos en un plazo máximo de 30 días naturales.
        </P>
        <P>
          Si considerás que el tratamiento de tus datos no cumple con la normativa, tenés derecho a presentar una
          reclamación ante la Agencia Española de Protección de Datos (AEPD):{' '}
          <a
            href="https://www.aepd.es"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: '#72B8E6' }}
          >
            www.aepd.es
          </a>
        </P>

        <SectionTitle number="8" title="Seguridad de los Datos" />
        <P>
          Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos personales contra acceso
          no autorizado, pérdida, alteración o divulgación. Entre otras medidas:
        </P>
        <Ul
          items={[
            'Cifrado de datos en tránsito mediante protocolos TLS/HTTPS.',
            'Cifrado de datos en reposo mediante AES-256.',
            'Infraestructura en servidores con certificación ISO 27001.',
            'Acceso restringido a datos personales por parte del personal de MESSIRVE bajo principio de necesidad.',
          ]}
        />
        <P>
          En caso de violación de seguridad que pueda afectar tus derechos y libertades, te notificaremos sin
          dilación indebida y, en todo caso, dentro de las 72 horas siguientes a tener conocimiento de ella, tal
          como exige el RGPD.
        </P>

        <SectionTitle number="9" title="Cookies y Tecnologías de Seguimiento" />
        <P>
          La App puede utilizar cookies y tecnologías similares para mejorar la experiencia de uso, analizar el
          tráfico y ofrecer funcionalidades personalizadas. Al usar la App por primera vez, se te solicitará
          consentimiento para el uso de cookies no esenciales. Podés gestionar tus preferencias de cookies en
          cualquier momento desde la configuración de la App o de tu dispositivo.
        </P>

        <SectionTitle number="10" title="Menores de Edad" />
        <P>
          MESSIRVE no está dirigida a menores de 18 años. No recopilamos conscientemente datos personales de menores.
          Si detectamos que hemos recopilado datos de un menor sin el consentimiento parental correspondiente,
          procederemos a eliminarlos de inmediato. Si sos padre, madre o tutor y tenés conocimiento de que tu hijo/a
          menor nos ha proporcionado datos personales, por favor contactanos en messirve.barna@gmail.com.
        </P>

        <SectionTitle number="11" title="Cambios en esta Política" />
        <P>
          Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas o
          en la normativa aplicable. Notificaremos cambios sustanciales por correo electrónico o mediante aviso en la
          App con al menos 30 días de anticipación. La fecha de la última actualización siempre figura al inicio de
          este documento.
        </P>

        <SectionTitle number="12" title="Contacto y Reclamaciones" />
        <P>
          Para cualquier consulta, solicitud de ejercicio de derechos o reclamación en materia de protección de
          datos:
        </P>
        <Ul
          items={[
            'Email: messirve.barna@gmail.com',
            'WhatsApp: +34 603 848 988',
            'Instagram: @messirve_bcn',
          ]}
        />
        <P>Para reclamaciones ante la autoridad de control:</P>
        <Ul
          items={[
            'Agencia Española de Protección de Datos (AEPD)',
            'Web: www.aepd.es',
            'Dirección: C/ Jorge Juan, 6, 28001 Madrid',
          ]}
        />
      </div>
    </div>
  )
}

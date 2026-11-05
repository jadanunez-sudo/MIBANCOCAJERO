

let cuentas = [
  {
    nombre: "Mali",
    saldo: 200,
    password: "1234",
    dni: "44788834"
  },
  {
    nombre: "Gera",
    saldo: 150,
    password: "5678",
    dni: "10247439"
  },
  {
    nombre: "Sabi",
    saldo: 60,
    password: "9102",
    dni: "98005362"
  }
];

let cuentaActual = null;
let campoActivo = "dni";
let movimientos = [];


function elemento(id) {
  return document.getElementById(id);
}

function dinero(monto) {
  return "S/ " + Number(monto).toFixed(2);
}

function mostrar(id) {
  elemento(id).classList.remove("oculto");
}

function ocultar(id) {
  elemento(id).classList.add("oculto");
}

function montoValido(monto) {
  return Number.isFinite(monto) &&
         monto > 0 &&
         Math.round(monto * 100) === monto * 100;
}

function numeroMonto(id) {
  return Number(elemento(id).value);
}



function seleccionarCampo(campo) {
  campoActivo = campo;

  elemento("dni").classList.remove("campoActivo");
  elemento("password").classList.remove("campoActivo");

  elemento(campo).classList.add("campoActivo");
}

function agregarNumero(numero) {
  let campo = elemento(campoActivo);

  if (campoActivo === "dni") {
    if (campo.value.length < 8) {
      campo.value += numero;
    }

    if (campo.value.length === 8) {
      seleccionarCampo("password");
    }
  } else {
    if (campo.value.length < 4) {
      campo.value += numero;
    }
  }
}

function borrarNumero() {
  let campo = elemento(campoActivo);
  campo.value = campo.value.slice(0, -1);
}

function mostrarPassword() {
  let campo = elemento("password");
  let boton = elemento("btnOjo");

  if (campo.type === "password") {
    campo.type = "text";
    boton.innerText = "🙈";
  } else {
    campo.type = "password";
    boton.innerText = "👁";
  }
}

function limpiarLogin() {
  elemento("dni").value = "";
  elemento("password").value = "";
  elemento("password").type = "password";
  elemento("btnOjo").innerText = "👁";
  elemento("mensajeLogin").innerText = "";

  seleccionarCampo("dni");
}

function iniciarSesion() {
  let dni = elemento("dni").value;
  let password = elemento("password").value;

  if (!/^\d{8}$/.test(dni)) {
    elemento("mensajeLogin").innerText =
      "Ingrese un DNI válido de 8 dígitos.";
    seleccionarCampo("dni");
    return;
  }

  if (!/^\d{4}$/.test(password)) {
    elemento("mensajeLogin").innerText =
      "Ingrese una contraseña de 4 dígitos.";
    seleccionarCampo("password");
    return;
  }

  let encontrada = cuentas.find(function(cuenta) {
    return cuenta.dni === dni &&
           cuenta.password === password;
  });

  if (!encontrada) {
    elemento("mensajeLogin").innerText =
      "DNI o contraseña incorrectos.";

    elemento("password").value = "";
    seleccionarCampo("password");
    return;
  }

  cuentaActual = encontrada;

  elemento("usuarioActual").innerText =
    "Bienvenido, " + cuentaActual.nombre;

  ocultar("loginPantalla");
  ocultar("operacion");
  mostrar("menu");

  elemento("mensajeLogin").innerText = "";
}

function cerrarSesion() {
  cuentaActual = null;

  ocultar("menu");
  ocultar("operacion");
  mostrar("loginPantalla");

  limpiarLogin();
}



function mostrarOperacion(titulo) {
  if (!cuentaActual) return;

  ocultar("menu");
  mostrar("operacion");

  elemento("tituloOperacion").innerText = titulo;
  elemento("contenidoOperacion").innerHTML = "";
}

function volverMenu() {
  ocultar("operacion");

  if (cuentaActual) {
    mostrar("menu");
  } else {
    mostrar("loginPantalla");
  }
}



function consultarSaldo() {
  mostrarOperacion("Consultar saldo");

  elemento("contenidoOperacion").innerHTML = `
    <div class="cajaOperacion">
      <p class="textoOperacion">
        Su saldo disponible es:
      </p>

      <div class="saldoGrande">
        ${dinero(cuentaActual.saldo)}
      </div>
    </div>
  `;
}



function crearBotonesMonto(id) {
  const montos = [20, 50, 100, 150, 200, 400];

  return `
    <div class="montosRapidos">
      ${montos.map(monto => `
        <button
          type="button"
          onclick="seleccionarMonto('${id}', ${monto})"
        >
          ${dinero(monto)}
        </button>
      `).join("")}
    </div>
  `;
}

function seleccionarMonto(id, monto) {
  elemento(id).value = monto;
}

function cambiarMonto(id, cantidad) {
  let campo = elemento(id);
  let actual = Number(campo.value) || 0;

  campo.value = Math.max(
    0,
    Math.round((actual + cantidad) * 100) / 100
  );
}

function crearControlMonto(id) {
  return `
    <div class="controlMonto">

      <button
        type="button"
        class="btnMenos"
        onclick="cambiarMonto('${id}', -10)"
      >−</button>

      <div class="campoMonto">
        <span>S/</span>

        <input
          id="${id}"
          type="number"
          value="0"
          min="0"
          step="0.01"
        >
      </div>

      <button
        type="button"
        class="btnMas"
        onclick="cambiarMonto('${id}', 10)"
      >+</button>

    </div>
  `;
}



function mostrarDeposito() {
  mostrarOperacion("Ingresar monto");

  elemento("contenidoOperacion").innerHTML = `
    <div class="cajaOperacion">

      <p class="textoOperacion">
        Seleccione o ingrese el monto que desea depositar
      </p>

      ${crearBotonesMonto("montoDeposito")}
      ${crearControlMonto("montoDeposito")}

      <button
        class="btn-principal"
        onclick="depositar()"
      >
        Depositar
      </button>

    </div>
  `;
}

function depositar() {
  let monto = numeroMonto("montoDeposito");

  if (!montoValido(monto)) {
    mostrarError("Ingrese un monto válido.");
    return;
  }

  procesarOperacion(function() {
    cuentaActual.saldo =
      Math.round((cuentaActual.saldo + monto) * 100) / 100;

    registrarMovimiento(
      "Depósito",
      monto,
      "Depósito realizado en cuenta"
    );

    mostrarResultadoMovimiento(
      "Depósito realizado con éxito.",
      "Monto depositado: " + dinero(monto),
      mostrarSaldoFinal
    );
  });
}


function mostrarRetiro() {
  mostrarOperacion("Retirar monto");

  elemento("contenidoOperacion").innerHTML = `
    <div class="cajaOperacion">

      <p class="saldoDisponible">
        Saldo disponible:
        <strong>${dinero(cuentaActual.saldo)}</strong>
      </p>

      <p class="textoOperacion">
        Seleccione o ingrese el monto a retirar
      </p>

      ${crearBotonesMonto("montoRetiro")}
      ${crearControlMonto("montoRetiro")}

      <button
        class="btn-principal"
        onclick="retirar()"
      >
        Retirar
      </button>

    </div>
  `;
}

function retirar() {
  let monto = numeroMonto("montoRetiro");

  if (!montoValido(monto)) {
    mostrarError("Ingrese un monto válido.");
    return;
  }

  if (monto > cuentaActual.saldo) {
    mostrarError(
      "Saldo insuficiente. La cuenta no puede quedar en negativo."
    );
    return;
  }

  procesarOperacion(function() {
    cuentaActual.saldo =
      Math.round((cuentaActual.saldo - monto) * 100) / 100;

    registrarMovimiento(
      "Retiro",
      monto,
      "Retiro de efectivo"
    );

    mostrarResultadoMovimiento(
      "Retiro realizado con éxito.",
      "Monto retirado: " + dinero(monto),
      mostrarSaldoFinal
    );
  });
}



function mostrarServicios() {
  mostrarOperacion("Pagar servicios");

  elemento("contenidoOperacion").innerHTML = `
    <div class="cajaOperacion">

      <p class="textoOperacion">
        Seleccione el servicio que desea pagar
      </p>

      <p class="saldoDisponible">
        Saldo disponible:
        <strong>${dinero(cuentaActual.saldo)}</strong>
      </p>

      <select id="servicio">
        <option value="Luz">💡 Luz</option>
        <option value="Agua">💧 Agua</option>
        <option value="Internet">🌐 Internet</option>
        <option value="Teléfono">📞 Teléfono</option>
      </select>

      <input
        type="number"
        id="montoServicio"
        min="0.01"
        step="0.01"
        placeholder="Monto a pagar"
      >

      <button
        class="btn-principal"
        onclick="pagarServicio()"
      >
        Pagar servicio
      </button>

    </div>
  `;
}

function pagarServicio() {
  let servicio = elemento("servicio").value;
  let monto = numeroMonto("montoServicio");

  if (!montoValido(monto)) {
    mostrarError("Ingrese un monto válido.");
    return;
  }

  if (monto > cuentaActual.saldo) {
    mostrarError("Saldo insuficiente.");
    return;
  }

  procesarOperacion(function() {
    cuentaActual.saldo =
      Math.round((cuentaActual.saldo - monto) * 100) / 100;

    registrarMovimiento(
      "Pago de servicio",
      monto,
      "Pago de " + servicio
    );

    mostrarResultadoMovimiento(
      "Pago realizado con éxito.",
      servicio + " pagado por " + dinero(monto),
      mostrarSaldoFinal
    );
  });
}


function mostrarTransferencia() {
  mostrarOperacion("Transferencia");

  let opciones = cuentas
    .map(function(cuenta, indice) {
      if (cuenta === cuentaActual) return "";

      return `
        <option value="${indice}">
          ${cuenta.nombre}
        </option>
      `;
    })
    .join("");

  elemento("contenidoOperacion").innerHTML = `
    <div class="cajaOperacion">

      <p class="saldoDisponible">
        Saldo disponible:
        <strong>${dinero(cuentaActual.saldo)}</strong>
      </p>

      <p class="textoOperacion">
        Seleccione la cuenta de destino
      </p>

      <select id="cuentaDestino">
        ${opciones}
      </select>

      <input
        type="number"
        id="montoTransferencia"
        min="0.01"
        step="0.01"
        placeholder="Monto a transferir"
      >

      <button
        class="btn-principal"
        onclick="transferir()"
      >
        Transferir
      </button>

    </div>
  `;
}

function transferir() {
  let indice = Number(elemento("cuentaDestino").value);
  let destino = cuentas[indice];
  let monto = numeroMonto("montoTransferencia");

  if (!destino || destino === cuentaActual) {
    mostrarError("Seleccione una cuenta válida.");
    return;
  }

  if (!montoValido(monto)) {
    mostrarError("Ingrese un monto válido.");
    return;
  }

  if (monto > cuentaActual.saldo) {
    mostrarError("Saldo insuficiente.");
    return;
  }

  procesarOperacion(function() {
    cuentaActual.saldo =
      Math.round((cuentaActual.saldo - monto) * 100) / 100;

    destino.saldo =
      Math.round((destino.saldo + monto) * 100) / 100;

    registrarMovimiento(
      "Transferencia",
      monto,
      "Transferencia enviada a " + destino.nombre
    );

    movimientos.push({
      cuenta: destino.dni,
      tipo: "Transferencia recibida",
      monto: monto,
      detalle: "Transferencia recibida de " + cuentaActual.nombre,
      fecha: new Date().toLocaleString("es-PE")
    });

    mostrarResultadoMovimiento(
      "Transferencia realizada con éxito.",
      "Transferiste " + dinero(monto) + " a " + destino.nombre,
      mostrarSaldoFinal
    );
  });
}



function registrarMovimiento(tipo, monto, detalle) {
  movimientos.push({
    cuenta: cuentaActual.dni,
    tipo: tipo,
    monto: monto,
    detalle: detalle,
    fecha: new Date().toLocaleString("es-PE")
  });
}



function mostrarMovimientos() {
  mostrarOperacion("Movimientos realizados");

  let lista = movimientos.filter(function(movimiento) {
    return movimiento.cuenta === cuentaActual.dni;
  });

  if (lista.length === 0) {
    elemento("contenidoOperacion").innerHTML = `
      <div class="cajaOperacion">
        <p class="sinMovimientos">
          No hay movimientos registrados.
        </p>
      </div>
    `;
    return;
  }

  let filas = lista
    .slice()
    .reverse()
    .map(function(movimiento) {
      return `
        <tr>
          <td>${movimiento.fecha}</td>
          <td>${movimiento.tipo}</td>
          <td>${dinero(movimiento.monto)}</td>
          <td>${movimiento.detalle}</td>
        </tr>
      `;
    })
    .join("");

  elemento("contenidoOperacion").innerHTML = `
    <div class="reporteMovimientos">

      <h3>Cuenta: ${cuentaActual.nombre}</h3>

      <table class="tablaMovimientos">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Movimiento</th>
            <th>Monto</th>
            <th>Detalle</th>
          </tr>
        </thead>

        <tbody>
          ${filas}
        </tbody>
      </table>

    </div>
  `;
}



let operacionEnProceso = false;

function mostrarProcesando() {
  mostrar("modalProcesando");
}

function ocultarProcesando() {
  ocultar("modalProcesando");
}

function procesarOperacion(accion) {
  if (operacionEnProceso || !cuentaActual) return;

  operacionEnProceso = true;
  mostrarProcesando();

  setTimeout(function() {
    try {
      accion();
    } catch (error) {
      console.error(error);
      mostrarError("Ocurrió un error al procesar.");
    } finally {
      ocultarProcesando();
      operacionEnProceso = false;
    }
  }, 1800);
}


function mostrarResultadoMovimiento(titulo, detalle, siguientePaso) {
  elemento("tituloResultadoMovimiento").innerText = titulo;
  elemento("detalleResultadoMovimiento").innerText = detalle;

  mostrar("modalResultadoMovimiento");

  setTimeout(function() {
    ocultar("modalResultadoMovimiento");

    if (siguientePaso) {
      siguientePaso();
    } else {
      volverMenu();
    }
  }, 4000);
}



function mostrarSaldoFinal() {
  if (!cuentaActual) return;

  let ultimos4 = cuentaActual.dni.slice(-4);

  elemento("cuentaSaldoFinal").innerText =
    "Ahorro soles: *******" + ultimos4;

  elemento("montoSaldoFinal").innerText =
    dinero(cuentaActual.saldo);

  mostrar("modalSaldoFinal");

  setTimeout(function() {
    ocultar("modalSaldoFinal");
    volverMenu();
  }, 4000);
}



function mostrarExito(mensaje) {
  elemento("mensajeExito").innerText = mensaje;
  mostrar("modalExito");
}

function cerrarModal() {
  ocultar("modalExito");
  volverMenu();
}


function mostrarError(mensaje) {
  elemento("mensajeError").innerText = mensaje;
  mostrar("modalError");
}

function cerrarError() {
  ocultar("modalError");
}


seleccionarCampo("dni");

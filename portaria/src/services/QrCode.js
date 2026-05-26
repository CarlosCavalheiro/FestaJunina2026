import CryptoJS from 'crypto-js';
import { Html5Qrcode } from 'html5-qrcode';
import QRCode from 'qrcode';

let html5QrCode;

//  Carrega dados salvos
let usedQRCodes = JSON.parse(localStorage.getItem("usedQRCodes")) || {};
console.log("usedQRCodes carregado:", usedQRCodes);

let isCooldown = false;

// =========================
//  GERAR QR CODE (AGORA COM IMAGEM)
// =========================
/* function gerarQR() {
  const dados = {
    id: "QR-" + Date.now(),
    nome: "Festa Julina"
    };

    const chave = "minha-chave-secreta";

    const jsonString = JSON.stringify(dados);

    const textoCriptografado = CryptoJS.AES.encrypt(jsonString, chave).toString();

  const div = document.getElementById("qrcode");
  div.innerHTML = ""; // limpa antes

  const canvas = document.createElement("canvas");

  QRCode.toCanvas(canvas, textoCriptografado, function (err) {
    if (err) {
      console.error(err);
      div.innerHTML = "Erro ao gerar QR ❌";
      return;
    }

    // adiciona imagem
    div.appendChild(canvas);

    // mostra o ID
    const texto = document.createElement("p");
    texto.innerText = dados.id;
    div.appendChild(texto);

    // botão de download
    const link = document.createElement("a");
    link.innerText = "📥 Baixar QR Code";
    link.download = `${dados.id}.png`;
    link.href = canvas.toDataURL();
    link.style.display = "block";
    link.style.marginTop = "10px";

    div.appendChild(link);
  });
} */

// =========================
//  INICIAR CÂMERA
// =========================
async function iniciarCamera() {
  await Html5Qrcode.getCameras()
    .then((devices) => {
      if (devices && devices.length) {
        const cameraId = devices[0].id;
        console.log("Câmera encontrada:", devices[0].label);
        startScanner(cameraId);
      } else {
        console.error("Nenhuma câmera encontrada.");
        alert("Nenhuma câmera encontrada. Verifique as permissões.");
      }
    })
    .catch((err) => {
      console.error("Erro ao acessar câmeras:", err);
      alert("Erro ao acessar câmeras. Verifique as permissões.");
    });
}
function startScanner(cameraId) {
  const qrArea = document.querySelector('.qr-area');
  const leitor = document.getElementById('leitor-area');

  if (qrArea) {
    qrArea.style.display = 'none';
  }

  if (leitor) {
    leitor.style.display = 'block';
  }

  html5QrCode = new Html5Qrcode("leitor");

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 1, qrbox: 250 },
    onScanSuccess,
    onScanFailure
  );
}

// =========================
//  SUCESSO NA LEITURA
// =========================
function onScanSuccess(decodedText) {
  if (isCooldown) {
    console.log("Cooldown ativo, ignorando leitura");
    return;
  }

  isCooldown = true;

  const resultDiv = document.getElementById("resultado");
  const chave = "minha-chave-secreta";

  try {
    // 🔓 DESCRIPTOGRAFAR
    const bytes = CryptoJS.AES.decrypt(decodedText, chave);

    const textoOriginal = bytes.toString(CryptoJS.enc.Utf8);

    // Se falhar aqui, significa chave errada ou QR inválido
    if (!textoOriginal) {
      throw new Error("Falha ao descriptografar");
    }

    // 📦 Converter para JSON
    const dados = JSON.parse(textoOriginal);

    const id = dados.id;

    console.log("ID lido:", id);
    console.log("usedQRCodes atual:", usedQRCodes);

    // Mostra o ID lido na tela
    resultDiv.innerHTML = `QR lido: ${id}<br>Verificando status...`;

    // ✅ SUA LÓGICA NORMAL
    if (usedQRCodes[id]) {
      resultDiv.innerHTML = `
        QR lido: <strong>${id}</strong><br>
        Mensagem: ${textoOriginal}<br>
        <span style="color:red">Status: JÁ USADO ❌</span><br><br>
        <button onclick="liberarQR('${id}')">🔓 Liberar novamente</button>
      `;
    } else {
      usedQRCodes[id] = true;
      salvar();

      resultDiv.innerHTML = `
        QR lido: <strong>${id}</strong><br>
        Mensagem: ${textoOriginal}<br>
        <span style="color:green">VÁLIDO ✅</span>
      `;
    }

    // Inicia cooldown
    let countdown = 5;
    resultDiv.innerHTML += `<br><span id='cooldown' style='color:orange'>Espere por: ${countdown} segundos...</span>`;
    const interval = setInterval(() => {
      countdown--;
      const cooldownEl = document.getElementById('cooldown');
      if (cooldownEl) {
        cooldownEl.innerText = `Espere por: ${countdown} segundos...`;
      }
      if (countdown <= 0) {
        clearInterval(interval);
        isCooldown = false;
        resultDiv.innerHTML = "Aguardando ação...";
      }
    }, 1000);

  } catch (erro) {
    console.error("Erro ao descriptografar:", erro);

    resultDiv.innerHTML = `
      <span style="color:red">
        QR inválido ou chave incorreta ❌
      </span>
    `;
    // Mesmo em erro, aplica cooldown para evitar spam
    let countdown = 5;
    resultDiv.innerHTML += `<br><span id='cooldown' style='color:orange'>Espere por: ${countdown} segundos...</span>`;
    const interval = setInterval(() => {
      countdown--;
      const cooldownEl = document.getElementById('cooldown');
      if (cooldownEl) {
        cooldownEl.innerText = `Espere por: ${countdown} segundos...`;
      }
      if (countdown <= 0) {
        clearInterval(interval);
        isCooldown = false;
        resultDiv.innerHTML = "Aguardando ação...";
      }
    }, 1000);
  }

    console.log("Lido:", decodedText);
    console.log("Descriptografado:", textoOriginal);
}
// =========================
//  FALHA NA LEITURA
// =========================
function onScanFailure(error) {
  console.log("Erro ao ler QR:", error);
}

/*
// =========================
//  LIBERAR QR
// =========================
function liberarQR(id) {
  delete usedQRCodes[id];
  salvar();

  document.getElementById("resultado").innerHTML =
    "QR liberado novamente! Pode usar de novo ✅";
} */

// =========================
//  SALVAR
// =========================
function salvar() {
  localStorage.setItem("usedQRCodes", JSON.stringify(usedQRCodes));
}

// =========================
//  LIMPAR TUDO
// =========================
/* function limparTudo() {
  localStorage.clear();
  usedQRCodes = {};

  document.getElementById("resultado").innerHTML =
    "Tudo resetado! Pode testar novamente 🚀";
} */

// Exports para serem usados quando importado
export {
  iniciarCamera,
  onScanSuccess,
  onScanFailure,
  salvar,
  usedQRCodes
};
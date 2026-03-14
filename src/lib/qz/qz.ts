import qz from "qz-tray";

export function setupQZ() {

  qz.security.setCertificatePromise((resolve, reject) => {
    fetch("/digital-certificate.txt", { cache: "no-store" })
      .then(res => res.text())
      .then(resolve)
      .catch(reject);
  });

  qz.security.setSignatureAlgorithm("SHA512");

  qz.security.setSignaturePromise((toSign) => {
    return (resolve, reject) => {
      fetch(`/api/qz-sign?request=${encodeURIComponent(toSign)}`, {
        cache: "no-store"
      })
        .then(res => res.text())
        .then(resolve)
        .catch(reject);
    };
  });
}

export async function connectQZ() {
  if (!qz.websocket.isActive()) {
    await qz.websocket.connect();
  }
}

export async function disconnectQZ() {
  if (qz.websocket.isActive()) {
    await qz.websocket.disconnect();
  }
}

export async function printToThermal(printerName: string, data: string[]) {
  const config = qz.configs.create(printerName);
  await qz.print(config, data);
}
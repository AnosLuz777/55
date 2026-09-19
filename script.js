var connectButton = document.getElementById("connectButton");
var syncButton = document.getElementById("syncButton");
var refreshButton = document.getElementById("refreshButton");

var connectionStatus = document.getElementById("connectionStatus");
var connectionDetail = document.getElementById("connectionDetail");
var profileStatus = document.getElementById("profileStatus");
var onlineDot = document.getElementById("onlineDot");

var pendingCount = document.getElementById("pendingCount");
var expiredCount = document.getElementById("expiredCount");
var totalCount = document.getElementById("totalCount");
var totalValue = document.getElementById("totalValue");

var priceBig = document.getElementById("priceBig");
var priceQuantity = document.getElementById("priceQuantity");

var lastUpdate = document.getElementById("lastUpdate");
var detailUpdate = document.getElementById("detailUpdate");

var messageBox = document.getElementById("messageBox");

var progressBar = document.getElementById("progressBar");
var progressPercent = document.getElementById("progressPercent");
var progressText = document.getElementById("progressText");

var historyList = document.getElementById("historyList");
var notificationList = document.getElementById("notificationList");
var chartBars = document.getElementById("chartBars");

var conectando = false;
var sincronizando = false;

var historico = [];
var notificacoes = [];
var valoresGrafico = [];

function mensagem(texto, erro) {
if (messageBox === null) {
return;
}

```
messageBox.textContent = texto;

if (erro === true) {
    messageBox.classList.add("error");
} else {
    messageBox.classList.remove("error");
}
```

}

function valorReal(valor) {
var numero = Number(valor);

```
if (isNaN(numero)) {
    numero = 0;
}

return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
});
```

}

function horaAtual() {
return new Date().toLocaleTimeString("pt-BR", {
hour: "2-digit",
minute: "2-digit"
});
}

function atualizarConexao(conectado) {

```
if (connectionStatus !== null) {
    if (conectado) {
        connectionStatus.textContent = "● Conectado";
    } else {
        connectionStatus.textContent = "● Desconectado";
    }
}

if (connectionDetail !== null) {
    if (conectado) {
        connectionDetail.textContent = "Sessão ativa";
    } else {
        connectionDetail.textContent = "Aguardando login";
    }
}

if (profileStatus !== null) {
    if (conectado) {
        profileStatus.textContent = "Conectado";
    } else {
        profileStatus.textContent = "Desconectado";
    }
}

if (onlineDot !== null) {
    if (conectado) {
        onlineDot.classList.add("active");
    } else {
        onlineDot.classList.remove("active");
    }
}
```

}

function atualizarDados(dados) {

```
if (dados === null || dados === undefined) {
    return;
}

var pendentes = Number(dados.pendentes);
var expiradas = Number(dados.expiradas);
var total = Number(dados.total);
var valor = Number(dados.valor);

if (isNaN(pendentes) || pendentes < 0) {
    pendentes = 0;
}

if (isNaN(expiradas) || expiradas < 0) {
    expiradas = 0;
}

if (isNaN(total) || total < 0) {
    total = pendentes + expiradas;
}

if (isNaN(valor) || valor < 0) {
    valor = total * 0.15;
}

if (pendingCount !== null) {
    pendingCount.textContent = pendentes;
}

if (expiredCount !== null) {
    expiredCount.textContent = expiradas;
}

if (totalCount !== null) {
    totalCount.textContent = total;
}

if (totalValue !== null) {
    totalValue.textContent = valorReal(valor);
}

if (priceBig !== null) {
    priceBig.textContent = valorReal(valor);
}

if (priceQuantity !== null) {
    priceQuantity.textContent = total;
}

var hora = horaAtual();

if (lastUpdate !== null) {
    lastUpdate.textContent = hora;
}

if (detailUpdate !== null) {
    detailUpdate.textContent = "Sincronizado às " + hora;
}

atualizarProgresso(total);
atualizarGrafico(total);
adicionarHistorico(total);
```

}

function atualizarProgresso(total) {

```
var percentual = total;

if (percentual < 0) {
    percentual = 0;
}

if (percentual > 100) {
    percentual = 100;
}

if (progressBar !== null) {
    progressBar.style.width = percentual + "%";
}

if (progressPercent !== null) {
    progressPercent.textContent = percentual + "%";
}

if (progressText !== null) {
    progressText.textContent = total + " atividades";
}
```

}

function adicionarHistorico(total) {

```
historico.unshift({
    hora: horaAtual(),
    total: total
});

if (historico.length > 6) {
    historico.pop();
}

mostrarHistorico();
```

}

function mostrarHistorico() {

```
if (historyList === null) {
    return;
}

if (historico.length === 0) {
    historyList.innerHTML =
        "<div class=\"empty-state\">" +
        "Nenhuma sincronização realizada." +
        "</div>";

    return;
}

var html = "";

for (var i = 0; i < historico.length; i++) {

    html +=
        "<div class=\"history-item\">" +
            "<div>" +
                "<strong>Sincronização concluída</strong>" +
                "<span>" +
                    historico[i].hora +
                "</span>" +
            "</div>" +
            "<span>" +
                historico[i].total +
                " atividades" +
            "</span>" +
        "</div>";
}

historyList.innerHTML = html;
```

}

function adicionarNotificacao(texto) {

```
notificacoes.unshift({
    texto: texto,
    hora: horaAtual()
});

if (notificacoes.length > 5) {
    notificacoes.pop();
}

mostrarNotificacoes();
```

}

function mostrarNotificacoes() {

```
if (notificationList === null) {
    return;
}

if (notificacoes.length === 0) {
    notificationList.innerHTML =
        "<div class=\"empty-state\">" +
        "Nenhum evento recente." +
        "</div>";

    return;
}

var html = "";

for (var i = 0; i < notificacoes.length; i++) {

    html +=
        "<div class=\"notification-item\">" +
            "<div>" +
                "<strong>" +
                    notificacoes[i].texto +
                "</strong>" +
                "<span>" +
                    notificacoes[i].hora +
                "</span>" +
            "</div>" +
        "</div>";
}

notificationList.innerHTML = html;
```

}

function atualizarGrafico(total) {

```
valoresGrafico.push(total);

if (valoresGrafico.length > 8) {
    valoresGrafico.shift();
}

if (chartBars === null) {
    return;
}

var maior = 1;

for (var i = 0; i < valoresGrafico.length; i++) {

    if (valoresGrafico[i] > maior) {
        maior = valoresGrafico[i];
    }
}

var html = "";

for (var j = 0; j < valoresGrafico.length; j++) {

    var altura =
        Math.round(
            valoresGrafico[j] * 100 / maior
        );

    if (altura < 5) {
        altura = 5;
    }

    html +=
        "<div class=\"chart-bar\" " +
        "style=\"height:" +
        altura +
        "%\">" +
        "</div>";
}

chartBars.innerHTML = html;
```

}

function lerResposta(resposta) {

```
return resposta.text().then(function(texto) {

    if (texto === null || texto === "") {
        throw new Error(
            "O servidor não retornou nenhuma resposta."
        );
    }

    var dados;

    try {
        dados = JSON.parse(texto);
    } catch (erro) {
        throw new Error(
            "O servidor retornou uma resposta inválida."
        );
    }

    if (!resposta.ok) {
        throw new Error(
            dados.erro ||
            "Erro HTTP " +
            resposta.status
        );
    }

    return dados;
});
```

}

function conectarSala() {

```
if (conectando) {
    return;
}

conectando = true;

if (connectButton !== null) {
    connectButton.disabled = true;
    connectButton.textContent = "Abrindo...";
}

mensagem(
    "Abrindo a Sala do Futuro no navegador..."
);

fetch(
    "/api/sala-do-futuro/conectar",
    {
        method: "GET",
        cache: "no-store"
    }
)
.then(lerResposta)
.then(function(dados) {

    if (dados.sucesso !== true) {
        throw new Error(
            dados.erro ||
            "Não foi possível abrir a Sala do Futuro."
        );
    }

    atualizarConexao(true);

    adicionarNotificacao(
        "Navegador da Sala do Futuro aberto"
    );

    mensagem(
        "Navegador aberto. Faça o login e depois clique em Sincronizar."
    );
})
.catch(function(erro) {

    atualizarConexao(false);

    mensagem(
        erro.message ||
        "Erro ao abrir a Sala do Futuro.",
        true
    );
})
.then(function() {

    conectando = false;

    if (connectButton !== null) {
        connectButton.disabled = false;
        connectButton.textContent =
            "Acessar Sala do Futuro";
    }
});
```

}

function sincronizar() {

```
if (sincronizando) {
    return;
}

sincronizando = true;

if (syncButton !== null) {
    syncButton.disabled = true;
    syncButton.textContent = "Sincronizando...";
}

mensagem(
    "Sincronizando as atividades..."
);

fetch(
    "/api/sala-do-futuro/sincronizar",
    {
        method: "GET",
        cache: "no-store"
    }
)
.then(lerResposta)
.then(function(dados) {

    if (dados.sucesso !== true) {
        throw new Error(
            dados.erro ||
            "Não foi possível sincronizar."
        );
    }

    atualizarConexao(true);

    atualizarDados(dados);

    adicionarNotificacao(
        "Sincronização concluída"
    );

    mensagem(
        "Sincronização concluída com sucesso."
    );
})
.catch(function(erro) {

    mensagem(
        erro.message ||
        "Erro ao sincronizar.",
        true
    );

    adicionarNotificacao(
        "Erro durante a sincronização"
    );
})
.then(function() {

    sincronizando = false;

    if (syncButton !== null) {
        syncButton.disabled = false;
        syncButton.textContent = "Sincronizar";
    }
});
```

}

function atualizarStatus() {

```
fetch(
    "/api/sala-do-futuro/status",
    {
        method: "GET",
        cache: "no-store"
    }
)
.then(lerResposta)
.then(function(dados) {

    atualizarConexao(
        dados.conectado === true
    );

    if (
        dados.total !== undefined ||
        dados.pendentes !== undefined ||
        dados.expiradas !== undefined
    ) {
        atualizarDados(dados);
    }
})
.catch(function(erro) {

    console.log(
        "Erro ao consultar status"
    );
});
```

}

function iniciar() {

```
if (connectButton !== null) {
    connectButton.onclick = conectarSala;
}

if (syncButton !== null) {
    syncButton.onclick = sincronizar;
}

if (refreshButton !== null) {
    refreshButton.onclick = sincronizar;
}

atualizarConexao(false);

mostrarHistorico();

mostrarNotificacoes();

atualizarStatus();

setInterval(
    atualizarStatus,
    5000
);
```

}

if (document.readyState === "loading") {

```
document.addEventListener(
    "DOMContentLoaded",
    iniciar
);
```

} else {

```
iniciar();
```

}
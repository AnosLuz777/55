"use strict";

var PRICE_PER_ACTIVITY = 0.15;
var activities = [];
var selectedIds = [];
var currentFilter = "all";
var currentPage = "home";

function byId(id) {
    return document.getElementById(id);
}

function money(value) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(value);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showToast(message) {
    var toast = byId("toast");

    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(showToast.timer);

    showToast.timer = window.setTimeout(function () {
        toast.classList.remove("show");
    }, 3000);
}

function setLoginStatus(message, type) {
    var status = byId("loginStatus");

    if (!status) {
        return;
    }

    status.textContent = message || "";
    status.className = "form-status";

    if (type) {
        status.classList.add(type);
    }
}

function setSyncStatus(message, live) {
    var syncText = byId("syncText");
    var dot = document.querySelector(".sync-dot");

    if (syncText) {
        syncText.textContent = message;
    }

    if (dot) {
        if (live) {
            dot.classList.add("live");
        } else {
            dot.classList.remove("live");
        }
    }
}

function setPage(pageName) {
    var page = byId(pageName);

    if (!page) {
        return;
    }

    document.querySelectorAll(".page").forEach(function (item) {
        item.classList.remove("active");
    });

    document.querySelectorAll(".nav-button").forEach(function (button) {
        button.classList.remove("active");
    });

    page.classList.add("active");

    var activeButton = document.querySelector(
        '[data-page="' + pageName + '"]'
    );

    if (activeButton) {
        activeButton.classList.add("active");
    }

    var titles = {
        home: "Início",
        activities: "Atividades",
        request: "Solicitação",
        history: "Histórico",
        payments: "Pagamentos",
        extension: "Extensão"
    };

    var pageTitle = byId("pageTitle");

    if (pageTitle) {
        pageTitle.textContent = titles[pageName] || "55ANTISYSTEM";
    }

    currentPage = pageName;

    window.scrollTo(0, 0);

    if (pageName === "activities") {
        renderActivities();
    }
}

function statusLabel(activity) {
    return activity.status === "expired"
        ? "Expirada"
        : "Pendente";
}

function formatDate(value) {
    if (!value) {
        return "Data não informada";
    }

    var date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(date);
}

function filteredActivities() {
    if (currentFilter === "all") {
        return activities;
    }

    return activities.filter(function (activity) {
        return activity.status === currentFilter;
    });
}

function renderActivities() {
    var list = byId("activitiesList");

    if (!list) {
        return;
    }

    var data = filteredActivities();

    if (!data.length) {
        list.innerHTML =
            '<div class="empty-state">' +
            '<div class="empty-icon">55</div>' +
            '<p class="eyebrow">ATIVIDADES</p>' +
            '<h3>Nada encontrado</h3>' +
            '<p>Não há atividades para o filtro selecionado.</p>' +
            "</div>";

        return;
    }

    list.innerHTML = data.map(function (activity) {
        var checked =
            selectedIds.indexOf(activity.id) !== -1;

        var subject = escapeHtml(
            activity.subject || "Atividade"
        );

        var title = escapeHtml(
            activity.title || "Sem título"
        );

        var date = escapeHtml(
            formatDate(activity.dueDate)
        );

        var type = escapeHtml(
            activity.type || "Atividade"
        );

        return (
            '<article class="activity-item">' +
            '<div class="activity-item-top">' +
            '<div class="activity-type">' +
            subject +
            "</div>" +
            '<span class="status-pill ' +
            activity.status +
            '">' +
            statusLabel(activity) +
            "</span>" +
            "</div>" +
            '<h4 class="activity-item-title">' +
            title +
            "</h4>" +
            '<div class="activity-meta">' +
            type +
            " · Prazo: " +
            date +
            "</div>" +
            '<label class="select-row">' +
            '<input class="activity-check" type="checkbox" data-id="' +
            escapeHtml(activity.id) +
            '"' +
            (checked ? " checked" : "") +
            ">" +
            " Selecionar" +
            "</label>" +
            "</article>"
        );
    }).join("");

    list.querySelectorAll(".activity-check").forEach(
        function (checkbox) {
            checkbox.addEventListener(
                "change",
                function () {
                    toggleSelection(
                        checkbox.getAttribute("data-id")
                    );
                }
            );
        }
    );
}

function renderRecentActivities() {
    var container = byId("recentActivities");

    if (!container) {
        return;
    }

    if (!activities.length) {
        container.innerHTML =
            '<div class="empty-state">' +
            '<div class="empty-icon">55</div>' +
            '<p class="eyebrow">SINCRONIZAÇÃO</p>' +
            '<h3>Nenhuma atividade carregada</h3>' +
            '<p>Abra suas tarefas no Sala do Futuro para sincronizar.</p>' +
            "</div>";

        return;
    }

    container.innerHTML = activities
        .slice(0, 6)
        .map(function (activity, index) {
            return (
                '<article class="activity-card" style="animation-delay: ' +
                index * 0.04 +
                's">' +
                '<div class="activity-card-top">' +
                '<span class="activity-status">' +
                statusLabel(activity) +
                "</span>" +
                '<span class="activity-type">R$ 0,15</span>' +
                "</div>" +
                '<h4 class="activity-title">' +
                escapeHtml(
                    activity.title || "Sem título"
                ) +
                "</h4>" +
                '<div class="activity-meta">' +
                escapeHtml(
                    activity.subject || "Atividade"
                ) +
                " · Prazo: " +
                escapeHtml(
                    formatDate(activity.dueDate)
                ) +
                "</div>" +
                "</article>"
            );
        })
        .join("");
}

function updateStats() {
    var pending = activities.filter(function (activity) {
        return activity.status === "pending";
    }).length;

    var expired = activities.filter(function (activity) {
        return activity.status === "expired";
    }).length;

    var pendingElement = byId("pending");
    var expiredElement = byId("expired");
    var totalElement = byId("total");
    var priceElement = byId("price");

    if (pendingElement) {
        pendingElement.textContent = pending;
    }

    if (expiredElement) {
        expiredElement.textContent = expired;
    }

    if (totalElement) {
        totalElement.textContent = activities.length;
    }

    if (priceElement) {
        priceElement.textContent = money(
            activities.length * PRICE_PER_ACTIVITY
        );
    }
}

function updateSelection() {
    var selected = activities.filter(function (activity) {
        return selectedIds.indexOf(activity.id) !== -1;
    });

    var countElement = byId("selectedCount");
    var priceElement = byId("selectedPrice");

    if (countElement) {
        countElement.textContent =
            selected.length +
            (selected.length === 1
                ? " atividade"
                : " atividades");
    }

    if (priceElement) {
        priceElement.textContent = money(
            selected.length * PRICE_PER_ACTIVITY
        );
    }
}

function toggleSelection(id) {
    var index = selectedIds.indexOf(id);

    if (index === -1) {
        selectedIds.push(id);
    } else {
        selectedIds.splice(index, 1);
    }

    updateSelection();
}

function normalizeActivity(item, index) {
    item = item || {};

    var dueDate =
        item.dueDate ||
        item.deadline ||
        item.dataLimite ||
        item.prazo ||
        item.dataEntrega ||
        null;

    var now = new Date();
    var parsed = dueDate
        ? new Date(dueDate)
        : null;

    var status =
        item.status === "expired" ||
        item.expired === true
            ? "expired"
            : "pending";

    if (
        parsed &&
        !Number.isNaN(parsed.getTime()) &&
        parsed.getTime() < now.getTime()
    ) {
        status = "expired";
    }

    return {
        id: String(
            item.id ||
            item.codigo ||
            item.code ||
            index + 1
        ),

        title:
            item.title ||
            item.titulo ||
            item.nome ||
            "Atividade",

        subject:
            item.subject ||
            item.disciplina ||
            item.materia ||
            item.subjectName ||
            "Atividade",

        type:
            item.type ||
            item.tipo ||
            "Atividade online",

        dueDate: dueDate,

        status: status
    };
}

function applyStudentData(data) {
    if (!data) {
        return;
    }

    var name =
        data.nomeCompleto ||
        data.nome ||
        data.name ||
        "Aluno";

    var firstName =
        data.primeiroNome ||
        name.split(" ")[0] ||
        "Aluno";

    var ra =
        data.ra ||
        data.RA ||
        data.registration ||
        "Não informado";

    var rawActivities =
        data.atividades ||
        data.activities ||
        [];

    if (
        (!rawActivities ||
            !rawActivities.length) &&
        (
            Array.isArray(data.pendentes) ||
            Array.isArray(data.expiradas)
        )
    ) {
        rawActivities = [];

        if (Array.isArray(data.pendentes)) {
            rawActivities =
                rawActivities.concat(
                    data.pendentes
                );
        }

        if (Array.isArray(data.expiradas)) {
            rawActivities =
                rawActivities.concat(
                    data.expiradas
                );
        }
    }

    var studentName = byId("studentName");
    var studentRA = byId("studentRA");
    var avatar = byId("avatar");

    if (studentName) {
        studentName.textContent = firstName;
    }

    if (studentRA) {
        studentRA.textContent =
            ra === "Não informado"
                ? "RA não informado"
                : "RA " + ra;
    }

    if (avatar) {
        avatar.textContent =
            String(firstName)
                .trim()
                .charAt(0)
                .toUpperCase() || "55";
    }

    activities = rawActivities.map(
        normalizeActivity
    );

    selectedIds = [];

    updateStats();
    updateSelection();
    renderRecentActivities();
    renderActivities();

    setSyncStatus(
        activities.length
            ? "Sincronizado agora"
            : "Nenhuma tarefa encontrada",
        activities.length > 0
    );

    showToast(
        activities.length
            ? activities.length +
              " atividade(s) sincronizada(s)."
            : "Nenhuma tarefa encontrada."
    );
}

function login(event) {
    event.preventDefault();

    var ra = byId("ra").value.trim();
    var digit = byId("digit").value.trim();
    var uf = byId("uf").value;

    if (!ra || !digit || !uf) {
        setLoginStatus(
            "Preencha RA, dígito e UF.",
            "error"
        );

        return;
    }

    setLoginStatus(
        "Painel pronto. Abra suas tarefas no Sala do Futuro.",
        "success"
    );

    byId("loginScreen").classList.add("hidden");
    byId("app").classList.remove("hidden");

    setSyncStatus(
        "Aguardando tarefas do Sala do Futuro",
        false
    );

    setPage("home");
}

function syncStudent() {
    showToast(
        "Abra suas tarefas no Sala do Futuro para sincronizar."
    );

    setSyncStatus(
        "Aguardando tarefas do Sala do Futuro",
        false
    );
}

function requestSelection() {
    if (!selectedIds.length) {
        showToast(
            "Selecione pelo menos uma atividade."
        );

        return;
    }

    showToast(
        "Solicitação preparada com " +
        selectedIds.length +
        " atividade(s)."
    );
}

function logout() {
    byId("app").classList.add("hidden");
    byId("loginScreen").classList.remove("hidden");

    byId("loginForm").reset();

    setLoginStatus("", "");

    setSyncStatus(
        "Aguardando sincronização",
        false
    );

    activities = [];
    selectedIds = [];

    updateStats();
    updateSelection();
    renderRecentActivities();
}

function setupNavigation() {
    document
        .querySelectorAll(".nav-button")
        .forEach(function (button) {
            button.addEventListener(
                "click",
                function () {
                    setPage(
                        button.getAttribute(
                            "data-page"
                        )
                    );
                }
            );
        });

    document
        .querySelectorAll("[data-go]")
        .forEach(function (button) {
            button.addEventListener(
                "click",
                function () {
                    setPage(
                        button.getAttribute(
                            "data-go"
                        )
                    );
                }
            );
        });
}

function setupFilters() {
    document
        .querySelectorAll(".filter-button")
        .forEach(function (button) {
            button.addEventListener(
                "click",
                function () {
                    document
                        .querySelectorAll(
                            ".filter-button"
                        )
                        .forEach(
                            function (item) {
                                item.classList.remove(
                                    "active"
                                );
                            }
                        );

                    button.classList.add(
                        "active"
                    );

                    currentFilter =
                        button.getAttribute(
                            "data-filter"
                        );

                    renderActivities();
                }
            );
        });
}

function setupExtensionTutorial() {
    var deviceButtons =
        document.querySelectorAll(
            "[data-device]"
        );

    var browserButtons =
        document.querySelectorAll(
            "[data-browser]"
        );

    var pcTutorial =
        byId("pcTutorial");

    var androidTutorial =
        byId("androidTutorial");

    var iosTutorial =
        byId("iosTutorial");

    var browserTutorial =
        byId("browserTutorial");

    if (!deviceButtons.length) {
        return;
    }

    deviceButtons.forEach(function (button) {
        button.addEventListener(
            "click",
            function () {
                deviceButtons.forEach(
                    function (item) {
                        item.classList.remove(
                            "active"
                        );
                    }
                );

                button.classList.add("active");

                var device =
                    button.getAttribute(
                        "data-device"
                    );

                if (pcTutorial) {
                    pcTutorial.hidden =
                        device !== "pc";
                }

                if (androidTutorial) {
                    androidTutorial.hidden =
                        device !== "android";
                }

                if (iosTutorial) {
                    iosTutorial.hidden =
                        device !== "ios";
                }
            }
        );
    });

    browserButtons.forEach(function (button) {
        button.addEventListener(
            "click",
            function () {
                browserButtons.forEach(
                    function (item) {
                        item.classList.remove(
                            "active"
                        );
                    }
                );

                button.classList.add("active");

                var browser =
                    button.getAttribute(
                        "data-browser"
                    );

                if (!browserTutorial) {
                    return;
                }

                var tutorials = {
                    chrome: {
                        title: "Chrome",
                        url: "chrome://extensions"
                    },

                    edge: {
                        title: "Edge",
                        url: "edge://extensions"
                    },

                    firefox: {
                        title: "Firefox",
                        url: "about:addons"
                    },

                    opera: {
                        title: "Opera",
                        url: "opera://extensions"
                    }
                };

                var selected =
                    tutorials[browser];

                if (!selected) {
                    return;
                }

                browserTutorial.innerHTML =
                    "<strong>" +
                    selected.title +
                    "</strong>" +
                    "<ol>" +
                    "<li>Baixe a extensão pelo botão acima.</li>" +
                    "<li>Extraia o arquivo ZIP.</li>" +
                    "<li>Abra <strong>" +
                    selected.url +
                    "</strong>.</li>" +
                    "<li>Ative o modo do desenvolvedor.</li>" +
                    "<li>Clique em <strong>Carregar sem compactação</strong>.</li>" +
                    "<li>Selecione a pasta extraída.</li>" +
                    "<li>Recarregue o Sala do Futuro e o Luxury.</li>" +
                    "</ol>";
            }
        );
    });
}

function setupPixButton() {
    var button =
        byId("copyPixButton");

    var key =
        byId("pixKey");

    if (!button || !key) {
        return;
    }

    button.addEventListener(
        "click",
        function () {
            var value =
                key.textContent.trim();

            if (
                !value ||
                value ===
                    "Aguardando autenticação do Live Pix"
            ) {
                showToast(
                    "A chave Pix ainda não foi cadastrada."
                );

                return;
            }

            navigator.clipboard
                .writeText(value)
                .then(function () {
                    showToast(
                        "Chave Pix copiada."
                    );
                })
                .catch(function () {
                    showToast(
                        "Não foi possível copiar a chave."
                    );
                });
        }
    );
}

function setupLuxuryExtension() {
    window.addEventListener(
        "message",
        function (event) {
            if (
                event.source !== window ||
                !event.data
            ) {
                return;
            }

            if (
                event.data.origem ===
                "LUXURY_SALA_FUTURO"
            ) {
                applyStudentData(
                    event.data.dados
                );
            }
        }
    );

    window.postMessage(
        {
            origem: "LUXURY_SITE_PRONTO"
        },
        "*"
    );
}

document.addEventListener(
    "DOMContentLoaded",
    function () {
        var loginForm =
            byId("loginForm");

        var syncButton =
            byId("syncButton");

        var requestButton =
            byId("requestButton");

        var logoutButton =
            byId("logoutButton");

        if (loginForm) {
            loginForm.addEventListener(
                "submit",
                login
            );
        }

        if (syncButton) {
            syncButton.addEventListener(
                "click",
                syncStudent
            );
        }

        if (requestButton) {
            requestButton.addEventListener(
                "click",
                requestSelection
            );
        }

        if (logoutButton) {
            logoutButton.addEventListener(
                "click",
                logout
            );
        }

        setupNavigation();
        setupFilters();
        setupExtensionTutorial();
        setupPixButton();
        setupLuxuryExtension();

        updateStats();
        updateSelection();
        renderRecentActivities();
        renderActivities();
    }
);
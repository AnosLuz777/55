"use strict";

var PRICE_PER_ACTIVITY = 0.15;

var activities = [];

var selectedIds = [];

var currentFilter = "all";

var currentPage = "home";

var pixKey = "";


function byId(id) {
    return document.getElementById(id);
}


function money(value) {
    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    ).format(value);
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

    window.clearTimeout(
        showToast.timer
    );

    showToast.timer =
        window.setTimeout(
            function () {
                toast.classList.remove(
                    "show"
                );
            },
            3000
        );
}


function setLoginStatus(
    message,
    type
) {

    var status =
        byId("loginStatus");

    if (!status) {
        return;
    }

    status.textContent =
        message || "";

    status.className =
        "form-status";

    if (type) {
        status.classList.add(type);
    }
}


function setSyncStatus(
    message,
    live
) {

    var text =
        byId("syncText");

    var dot =
        document.querySelector(
            ".sync-dot"
        );

    if (text) {
        text.textContent =
            message;
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

    var page =
        byId(pageName);

    if (!page) {
        return;
    }

    document
        .querySelectorAll(".page")
        .forEach(
            function (item) {
                item.classList.remove(
                    "active"
                );
            }
        );

    document
        .querySelectorAll(".nav-button")
        .forEach(
            function (button) {
                button.classList.remove(
                    "active"
                );
            }
        );

    page.classList.add("active");

    var activeButton =
        document.querySelector(
            '[data-page="' +
            pageName +
            '"]'
        );

    if (activeButton) {
        activeButton.classList.add(
            "active"
        );
    }

    var titles = {

        home:
            "Início",

        activities:
            "Atividades",

        request:
            "Solicitação",

        history:
            "Histórico",

        payments:
            "Pagamentos",

        extension:
            "Extensão"
    };

    byId("pageTitle").textContent =
        titles[pageName] ||
        "55ANTISYSTEM";

    currentPage =
        pageName;

    window.scrollTo(
        0,
        0
    );

    if (
        pageName ===
        "activities"
    ) {

        renderActivities();
    }
}


function statusLabel(activity) {

    return activity.status ===
        "expired"
        ? "Expirada"
        : "Pendente";
}


function formatDate(value) {

    if (!value) {
        return "Data não informada";
    }

    if (
        typeof value ===
        "string" &&
        /^\d{2}\/\d{2}\/\d{4}$/.test(
            value
        )
    ) {

        return value;
    }

    var date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);
    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    ).format(date);
}


function filteredActivities() {

    if (
        currentFilter ===
        "all"
    ) {

        return activities;
    }

    return activities.filter(
        function (activity) {

            return activity.status ===
                currentFilter;
        }
    );
}


function renderActivities() {

    var list =
        byId(
            "activitiesList"
        );

    if (!list) {
        return;
    }

    var data =
        filteredActivities();

    if (!data.length) {

        list.innerHTML =
            '<div class="empty-state">' +
            '<div class="empty-icon">55</div>' +
            '<p class="eyebrow">ATIVIDADES</p>' +
            '<h3>Nada encontrado</h3>' +
            '<p>Não há atividades para o filtro selecionado.</p>' +
            '</div>';

        return;
    }

    list.innerHTML =
        data.map(
            function (activity) {

                var checked =
                    selectedIds.indexOf(
                        activity.id
                    ) !== -1;

                return (
                    '<article class="activity-item">' +

                    '<div class="activity-item-top">' +

                    '<div class="activity-type">' +
                    escapeHtml(
                        activity.subject
                    ) +
                    '</div>' +

                    '<span class="status-pill ' +
                    activity.status +
                    '">' +
                    statusLabel(
                        activity
                    ) +
                    '</span>' +

                    '</div>' +

                    '<h4 class="activity-item-title">' +
                    escapeHtml(
                        activity.title
                    ) +
                    '</h4>' +

                    '<div class="activity-meta">' +
                    escapeHtml(
                        activity.type
                    ) +
                    ' · Prazo: ' +
                    escapeHtml(
                        formatDate(
                            activity.dueDate
                        )
                    ) +
                    '</div>' +

                    '<label class="select-row">' +

                    '<input ' +
                    'class="activity-check" ' +
                    'type="checkbox" ' +
                    'data-id="' +
                    escapeHtml(
                        activity.id
                    ) +
                    '"' +
                    (
                        checked
                            ? " checked"
                            : ""
                    ) +
                    '> Selecionar' +

                    '</label>' +

                    '</article>'
                );

            }
        ).join("");

    list
        .querySelectorAll(
            ".activity-check"
        )
        .forEach(
            function (checkbox) {

                checkbox.addEventListener(
                    "change",
                    function () {

                        toggleSelection(
                            checkbox.getAttribute(
                                "data-id"
                            )
                        );

                    }
                );

            }
        );
}


function renderRecentActivities() {

    var container =
        byId(
            "recentActivities"
        );

    if (!container) {
        return;
    }

    if (!activities.length) {

        container.innerHTML =
            '<div class="empty-state">' +
            '<div class="empty-icon">55</div>' +
            '<p class="eyebrow">SINCRONIZAÇÃO</p>' +
            '<h3>Nenhuma atividade carregada</h3>' +
            '<p>Abra as tarefas no Sala do Futuro para sincronizar.</p>' +
            '</div>';

        return;
    }

    container.innerHTML =
        activities
            .slice(0, 6)
            .map(
                function (
                    activity,
                    index
                ) {

                    return (
                        '<article class="activity-card" ' +
                        'style="animation-delay:' +
                        (
                            index * 0.04
                        ) +
                        's">' +

                        '<div class="activity-card-top">' +

                        '<span class="activity-status">' +
                        statusLabel(
                            activity
                        ) +
                        '</span>' +

                        '<span class="activity-type">' +
                        'R$ 0,15' +
                        '</span>' +

                        '</div>' +

                        '<h4 class="activity-title">' +
                        escapeHtml(
                            activity.title
                        ) +
                        '</h4>' +

                        '<div class="activity-meta">' +
                        escapeHtml(
                            activity.subject
                        ) +
                        ' · Prazo: ' +
                        escapeHtml(
                            formatDate(
                                activity.dueDate
                            )
                        ) +
                        '</div>' +

                        '</article>'
                    );

                }
            )
            .join("");
}


function updateStats() {

    var pending =
        activities.filter(
            function (activity) {
                return activity.status ===
                    "pending";
            }
        ).length;

    var expired =
        activities.filter(
            function (activity) {
                return activity.status ===
                    "expired";
            }
        ).length;

    if (byId("pending")) {
        byId("pending").textContent =
            pending;
    }

    if (byId("expired")) {
        byId("expired").textContent =
            expired;
    }

    if (byId("total")) {
        byId("total").textContent =
            activities.length;
    }

    if (byId("price")) {
        byId("price").textContent =
            money(
                activities.length *
                PRICE_PER_ACTIVITY
            );
    }
}


function updateSelection() {

    var selected =
        activities.filter(
            function (activity) {

                return selectedIds.indexOf(
                    activity.id
                ) !== -1;

            }
        );

    if (byId("selectedCount")) {

        byId(
            "selectedCount"
        ).textContent =
            selected.length +
            (
                selected.length === 1
                    ? " atividade"
                    : " atividades"
            );
    }

    if (byId("selectedPrice")) {

        byId(
            "selectedPrice"
        ).textContent =
            money(
                selected.length *
                PRICE_PER_ACTIVITY
            );
    }
}


function toggleSelection(id) {

    var index =
        selectedIds.indexOf(id);

    if (index === -1) {

        selectedIds.push(id);

    } else {

        selectedIds.splice(
            index,
            1
        );
    }

    updateSelection();
}


function normalizeActivity(
    item,
    index
) {

    var dueDate =
        item.dueDate ||
        item.deadline ||
        item.dataLimite ||
        item.prazo ||
        null;

    var status =
        item.status ===
            "expired" ||
        item.status ===
            "expirada" ||
        item.expired === true
            ? "expired"
            : "pending";

    return {

        id:
            String(
                item.id ||
                item.codigo ||
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
            "Atividade",

        type:
            item.type ||
            item.tipo ||
            "Atividade online",

        dueDate:
            dueDate,

        status:
            status
    };
}


function applyStudentData(data) {

    if (!data) {
        return;
    }

    var nome =
        data.nomeCompleto ||
        data.primeiroNome ||
        "Aluno";

    var ra =
        data.ra ||
        data.RA ||
        "Não informado";

    if (
        byId("studentName")
    ) {

        byId(
            "studentName"
        ).textContent =
            nome;
    }

    if (
        byId("studentRA")
    ) {

        byId(
            "studentRA"
        ).textContent =
            "RA " + ra;
    }

    if (
        byId("avatar")
    ) {

        byId(
            "avatar"
        ).textContent =
            (
                nome
                    .trim()
                    .charAt(0)
                    .toUpperCase()
            ) ||
            "55";
    }

    var rawActivities =
        data.atividades ||
        data.activities ||
        [];

    activities =
        rawActivities.map(
            normalizeActivity
        );

    selectedIds = [];

    updateStats();

    updateSelection();

    renderRecentActivities();

    renderActivities();

    setSyncStatus(
        "Sincronizado agora",
        true
    );

    showToast(
        activities.length +
        " atividade(s) sincronizada(s)."
    );
}


function receiveExtensionData(
    event
) {

    if (
        event.source !== window
    ) {
        return;
    }

    if (!event.data) {
        return;
    }

    if (
        event.data.origem !==
        "LUXURY_SALA_FUTURO"
    ) {
        return;
    }

    applyStudentData(
        event.data.dados
    );
}


function setupExtensionTutorial() {

    document
        .querySelectorAll(
            "[data-device]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        document
                            .querySelectorAll(
                                "[data-device]"
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

                        var device =
                            button.getAttribute(
                                "data-device"
                            );

                        var pc =
                            byId(
                                "pcTutorial"
                            );

                        var android =
                            byId(
                                "androidTutorial"
                            );

                        var ios =
                            byId(
                                "iosTutorial"
                            );

                        if (pc) {
                            pc.hidden =
                                device !==
                                "pc";
                        }

                        if (android) {
                            android.hidden =
                                device !==
                                "android";
                        }

                        if (ios) {
                            ios.hidden =
                                device !==
                                "ios";
                        }

                    }
                );

            }
        );


    var browserTexts = {

        chrome: {
            name: "Chrome",
            steps: [
                "Baixe a extensão.",
                "Extraia o arquivo ZIP.",
                "Abra chrome://extensions.",
                "Ative o Modo do desenvolvedor.",
                "Clique em Carregar sem compactação.",
                "Selecione a pasta extraída.",
                "Abra o Sala do Futuro.",
                "Abra o Luxury."
            ]
        },

        edge: {
            name: "Microsoft Edge",
            steps: [
                "Baixe a extensão.",
                "Extraia o arquivo ZIP.",
                "Abra edge://extensions.",
                "Ative o Modo do desenvolvedor.",
                "Clique em Carregar sem compactação.",
                "Selecione a pasta extraída.",
                "Abra o Sala do Futuro.",
                "Abra o Luxury."
            ]
        },

        firefox: {
            name: "Firefox",
            steps: [
                "Baixe e extraia a extensão.",
                "Abra about:debugging.",
                "Clique em Este Firefox.",
                "Clique em Carregar extensão temporária.",
                "Selecione o arquivo manifest.json.",
                "Abra o Sala do Futuro.",
                "Abra o Luxury."
            ]
        },

        opera: {
            name: "Opera",
            steps: [
                "Baixe a extensão.",
                "Extraia o arquivo ZIP.",
                "Abra opera://extensions.",
                "Ative o Modo do desenvolvedor.",
                "Clique em Carregar extensão descompactada.",
                "Selecione a pasta extraída.",
                "Abra o Sala do Futuro.",
                "Abra o Luxury."
            ]
        }

    };


    document
        .querySelectorAll(
            "[data-browser]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        document
                            .querySelectorAll(
                                "[data-browser]"
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

                        var browser =
                            button.getAttribute(
                                "data-browser"
                            );

                        var info =
                            browserTexts[
                                browser
                            ];

                        var box =
                            byId(
                                "browserTutorial"
                            );

                        if (!box || !info) {
                            return;
                        }

                        var html =
                            "<strong>" +
                            escapeHtml(
                                info.name
                            ) +
                            "</strong>" +
                            "<ol>";

                        info.steps.forEach(
                            function (step) {

                                html +=
                                    "<li>" +
                                    escapeHtml(
                                        step
                                    ) +
                                    "</li>";

                            }
                        );

                        html +=
                            "</ol>";

                        box.innerHTML =
                            html;

                    }
                );

            }
        );


    var copyButton =
        byId(
            "copyPixButton"
        );

    if (copyButton) {

        copyButton.addEventListener(
            "click",
            function () {

                if (!pixKey) {

                    showToast(
                        "A chave Pix ainda não foi configurada."
                    );

                    return;
                }

                navigator.clipboard
                    .writeText(
                        pixKey
                    )
                    .then(
                        function () {

                            showToast(
                                "Chave Pix copiada."
                            );

                        }
                    );

            }
        );
    }
}


function setupNavigation() {

    document
        .querySelectorAll(
            ".nav-button"
        )
        .forEach(
            function (button) {

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

            }
        );


    document
        .querySelectorAll(
            "[data-go]"
        )
        .forEach(
            function (button) {

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

            }
        );
}


function setupFilters() {

    document
        .querySelectorAll(
            ".filter-button"
        )
        .forEach(
            function (button) {

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

            }
        );
}


window.addEventListener(
    "message",
    receiveExtensionData
);


document.addEventListener(
    "DOMContentLoaded",
    function () {

        var loginForm =
            byId(
                "loginForm"
            );

        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();

                    setLoginStatus(
                        "Abra o Sala do Futuro e deixe a extensão sincronizar as tarefas.",
                        "success"
                    );

                    setTimeout(
                        function () {

                            if (
                                byId(
                                    "loginScreen"
                                )
                            ) {

                                byId(
                                    "loginScreen"
                                ).classList.add(
                                    "hidden"
                                );
                            }

                            if (
                                byId("app")
                            ) {

                                byId(
                                    "app"
                                ).classList.remove(
                                    "hidden"
                                );
                            }

                        },
                        400
                    );

                }
            );

        }


        if (
            byId("syncButton")
        ) {

            byId(
                "syncButton"
            ).addEventListener(
                "click",
                function () {

                    window.postMessage(
                        {
                            origem:
                                "LUXURY_SITE_PRONTO"
                        },
                        "*"
                    );

                    setSyncStatus(
                        "Aguardando tarefas...",
                        false
                    );

                    showToast(
                        "Abra as tarefas no Sala do Futuro."
                    );

                }
            );

        }


        if (
            byId("requestButton")
        ) {

            byId(
                "requestButton"
            ).addEventListener(
                "click",
                function () {

                    if (
                        !selectedIds.length
                    ) {

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
            );

        }


        if (
            byId("logoutButton")
        ) {

            byId(
                "logoutButton"
            ).addEventListener(
                "click",
                function () {

                    byId(
                        "app"
                    ).classList.add(
                        "hidden"
                    );

                    byId(
                        "loginScreen"
                    ).classList.remove(
                        "hidden"
                    );

                    activities = [];

                    selectedIds = [];

                    updateStats();

                    updateSelection();

                    renderRecentActivities();

                }
            );

        }


        setupNavigation();

        setupFilters();

        setupExtensionTutorial();

        updateStats();

        updateSelection();

        renderRecentActivities();

        renderActivities();


        window.postMessage(
            {
                origem:
                    "LUXURY_SITE_PRONTO"
            },
            "*"
        );

    }
);
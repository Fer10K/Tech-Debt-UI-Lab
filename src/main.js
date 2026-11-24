import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Toast } from "bootstrap";
import "./style.css";
import axios from "axios";
import _ from "lodash";
import moment from "moment";
import { Chart } from "chart.js/auto";
import { v4 as uuidv4 } from "uuid";

let clients = [
  { id: 1, name: "Mariana Torres", company: "Nube Creativa", email: "mariana@nube.test", status: "Activo", value: 18500, date: "2026-11-20" },
  { id: 2, name: "Diego Ramírez", company: "Grupo Norte", email: "diego@gruponorte.test", status: "Prospecto", value: 9200, date: "2026-11-19" },
  { id: 3, name: "Sofía Herrera", company: "Studio Forma", email: "sofia@studioforma.test", status: "Activo", value: 24300, date: "2026-11-17" },
  { id: 4, name: "Carlos Medina", company: "Medina Legal", email: "carlos@medina.test", status: "Inactivo", value: 6700, date: "2026-11-14" },
  { id: 5, name: "Valentina Cruz", company: "Verde Vivo", email: "vale@verdevivo.test", status: "Prospecto", value: 12800, date: "2026-11-12" },
  { id: 6, name: "Andrés López", company: "Pixel House", email: "andres@pixel.test", status: "Activo", value: 31500, date: "2026-11-10" }
];

let tasks = [
  { id: "t1", title: "Enviar propuesta comercial", clientId: 2, date: "2026-11-25", done: false },
  { id: "t2", title: "Confirmar renovación de servicio", clientId: 3, date: "2026-11-26", done: false },
  { id: "t3", title: "Llamada de seguimiento", clientId: 5, date: "2026-11-27", done: false },
  { id: "t4", title: "Actualizar datos de contacto", clientId: 1, date: "2026-11-21", done: true }
];

let activityChart = null;
let currentView = "dashboard";
let selectedClient = null;
let notificationCount = 0;
const clientModal = new Modal(document.getElementById("client-modal"));
const taskModal = new Modal(document.getElementById("task-modal"));

function money(value) {
  return "$" + Number(value).toLocaleString("es-MX", { maximumFractionDigits: 0 });
}

function showToast(message) {
  document.getElementById("toast-message").innerText = message;
  const toast = new Toast(document.getElementById("app-toast"));
  toast.show();
}

function saveData() {
  localStorage.setItem("clientflow_clients", JSON.stringify(clients));
  localStorage.setItem("clientflow_tasks", JSON.stringify(tasks));
  notificationCount++;
}

function loadData() {
  let savedClients = localStorage.getItem("clientflow_clients");
  let savedTasks = localStorage.getItem("clientflow_tasks");
  if (savedClients) {
    try {
      clients = JSON.parse(savedClients);
    } catch (error) {
      console.log("No se pudieron cargar clientes", error);
    }
  }
  if (savedTasks) {
    try {
      tasks = JSON.parse(savedTasks);
    } catch (error) {
      console.log("No se pudieron cargar tareas", error);
    }
  }
}

function getClientName(id) {
  let client = clients.find(c => c.id == id);
  if (client) {
    return client.name;
  } else {
    return "Cliente eliminado";
  }
}

function statusBadge(status) {
  if (status === "Activo") {
    return '<span class="status-badge active">Activo</span>';
  } else if (status === "Prospecto") {
    return '<span class="status-badge prospect">Prospecto</span>';
  } else {
    return '<span class="status-badge inactive">Inactivo</span>';
  }
}

function renderStats() {
  let total = clients.length;
  let revenue = 0;
  let openTasks = 0;
  for (let i = 0; i < clients.length; i++) {
    revenue = revenue + Number(clients[i].value);
  }
  for (let j = 0; j < tasks.length; j++) {
    if (tasks[j].done === false) {
      openTasks++;
    }
  }
  document.getElementById("stat-clients").innerText = total;
  document.getElementById("stat-revenue").innerText = money(revenue);
  document.getElementById("stat-tasks").innerText = openTasks;
  document.getElementById("report-value").innerText = money(revenue);
  document.getElementById("report-active").innerText = clients.filter(c => c.status === "Activo").length;
  document.getElementById("report-prospects").innerText = clients.filter(c => c.status === "Prospecto").length;
  let active = clients.filter(c => c.status === "Activo").length;
  let prospect = clients.filter(c => c.status === "Prospecto").length;
  let inactive = clients.filter(c => c.status === "Inactivo").length;
  let max = clients.length || 1;
  document.getElementById("report-bars").innerHTML =
    '<div class="bar-row"><span>Activos</span><div class="bar-track"><div class="bar-fill purple-fill" style="width:' + (active / max * 100) + '%"></div></div><b>' + active + '</b></div>' +
    '<div class="bar-row"><span>Prospectos</span><div class="bar-track"><div class="bar-fill blue-fill" style="width:' + (prospect / max * 100) + '%"></div></div><b>' + prospect + '</b></div>' +
    '<div class="bar-row"><span>Inactivos</span><div class="bar-track"><div class="bar-fill gray-fill" style="width:' + (inactive / max * 100) + '%"></div></div><b>' + inactive + '</b></div>';
}

function renderRecentClients() {
  let recent = _.orderBy(clients, ["date"], ["desc"]).slice(0, 4);
  let html = "";
  recent.forEach(function(client) {
    html += "<tr><td><div class='person-cell'><span class='person-avatar'>" + client.name.charAt(0) + "</span><strong>" + client.name + "</strong></div></td>";
    html += "<td>" + client.company + "</td><td>" + statusBadge(client.status) + "</td><td>" + money(client.value) + "</td><td>" + moment(client.date).format("DD MMM, YYYY") + "</td></tr>";
  });
  document.getElementById("recent-clients").innerHTML = html;
}

function renderClients() {
  let search = document.getElementById("client-search").value.toLowerCase();
  let filter = document.getElementById("client-filter").value;
  let filtered = clients;
  if (search !== "") {
    filtered = filtered.filter(c => c.name.toLowerCase().includes(search) || c.company.toLowerCase().includes(search));
  }
  if (filter !== "all") {
    filtered = filtered.filter(c => c.status === filter);
  }
  let html = "";
  for (let i = 0; i < filtered.length; i++) {
    let c = filtered[i];
    html += "<tr><td><div class='person-cell'><span class='person-avatar'>" + c.name.charAt(0) + "</span><strong>" + c.name + "</strong></div></td>";
    html += "<td>" + c.company + "</td><td>" + c.email + "</td><td>" + statusBadge(c.status) + "</td><td>" + money(c.value) + "</td>";
    html += "<td><button class='table-action' onclick='editClient(" + c.id + ")'>Editar</button> <button class='table-action danger' onclick='deleteClient(" + c.id + ")'>Eliminar</button></td></tr>";
  }
  if (filtered.length === 0) {
    html = "<tr><td colspan='6' class='empty-state'>No se encontraron clientes.</td></tr>";
  }
  document.getElementById("clients-table").innerHTML = html;
}

function renderTasks() {
  let html = "";
  tasks.forEach(t => {
    let due = moment(t.date).format("DD MMM YYYY");
    html += '<article class="task-card ' + (t.done ? "task-done" : "") + '"><div class="task-card-top"><span class="task-tag">' + (t.done ? "Completada" : "Pendiente") + '</span><button class="table-action danger" onclick="deleteTask(\'' + t.id + '\')">Eliminar</button></div>';
    html += "<h3>" + t.title + "</h3><p>♙ " + getClientName(t.clientId) + "</p><div class='task-footer'><span>◷ " + due + "</span><button class='btn btn-sm " + (t.done ? "btn-light" : "btn-outline-primary") + "' onclick='toggleTask(\"" + t.id + "\")'>" + (t.done ? "Reabrir" : "Completar") + "</button></div></article>";
  });
  document.getElementById("tasks-list").innerHTML = html || '<p class="empty-state">No hay tareas registradas.</p>';
}

function renderUpcoming() {
  let pending = tasks.filter(t => t.done === false);
  pending = _.orderBy(pending, ["date"], ["asc"]).slice(0, 4);
  let html = "";
  pending.forEach(t => {
    html += '<div class="upcoming-item"><span class="upcoming-icon">◷</span><div><strong>' + t.title + '</strong><small>' + getClientName(t.clientId) + '</small></div><time>' + moment(t.date).format("DD MMM") + '</time></div>';
  });
  document.getElementById("upcoming-list").innerHTML = html || '<p class="empty-state">No hay seguimientos pendientes.</p>';
}

function renderChart() {
  let ctx = document.getElementById("activity-chart");
  let labels = ["Jun", "Jul", "Ago", "Sep", "Oct", "Nov"];
  let data = [12, 19, 15, 24, 21, clients.length * 4];
  if (activityChart) {
    activityChart.destroy();
  }
  activityChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Clientes",
        data: data,
        borderColor: "#7567e8",
        backgroundColor: "rgba(117,103,232,.10)",
        fill: true,
        tension: .38,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, grid: { color: "#f0eff5" } }, x: { grid: { display: false } } }
    }
  });
}

function renderAll() {
  renderStats();
  renderRecentClients();
  renderClients();
  renderTasks();
  renderUpcoming();
  renderChart();
}

function changeView(view) {
  currentView = view;
  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  document.getElementById(view + "-view").classList.remove("hidden");
  document.querySelectorAll(".nav-link").forEach(a => a.classList.remove("active"));
  document.querySelectorAll('[data-view="' + view + '"]').forEach(a => a.classList.add("active"));
  let titles = { dashboard: "Resumen general", clients: "Directorio de clientes", tasks: "Seguimientos", reports: "Reportes" };
  document.getElementById("page-title").innerText = titles[view];
  document.getElementById("crumb").innerText = titles[view];
  if (view === "reports") {
    renderStats();
  }
}

function openClientModal() {
  selectedClient = null;
  document.getElementById("client-form").reset();
  document.querySelector("#client-modal .modal-title").innerText = "Agregar cliente";
  clientModal.show();
}

function addClient(event) {
  event.preventDefault();
  let name = document.getElementById("client-name").value;
  let company = document.getElementById("client-company").value;
  let email = document.getElementById("client-email").value;
  let status = document.getElementById("client-status").value;
  let value = Number(document.getElementById("client-value").value);
  if (name.length > 0 && company.length > 0 && email.length > 0 && value >= 0) {
    let newClient = {
      id: Date.now(),
      uuid: uuidv4(),
      name: name,
      company: company,
      email: email,
      status: status,
      value: value,
      date: moment().format("YYYY-MM-DD")
    };
    if (selectedClient !== null) {
      let existing = clients.find(c => c.id == selectedClient);
      if (existing) {
        existing.name = name;
        existing.company = company;
        existing.email = email;
        existing.status = status;
        existing.value = value;
      }
      selectedClient = null;
      showToast("Cliente actualizado correctamente");
    } else {
      clients.push(newClient);
      showToast("Cliente agregado correctamente");
    }
    saveData();
    renderAll();
    clientModal.hide();
  } else {
    showToast("Revisa los campos del formulario");
  }
}

function editClient(id) {
  let c = clients.find(x => x.id == id);
  if (c) {
    selectedClient = c.id;
    document.getElementById("client-name").value = c.name;
    document.getElementById("client-company").value = c.company;
    document.getElementById("client-email").value = c.email;
    document.getElementById("client-status").value = c.status;
    document.getElementById("client-value").value = c.value;
    document.querySelector("#client-modal .modal-title").innerText = "Editar cliente";
    clientModal.show();
  }
}

function deleteClient(id) {
  if (confirm("¿Seguro que deseas eliminar este cliente?")) {
    clients = clients.filter(c => c.id != id);
    tasks = tasks.filter(t => t.clientId != id);
    saveData();
    renderAll();
    showToast("Cliente eliminado");
  }
}

function addTask(event) {
  event.preventDefault();
  let title = document.getElementById("task-title").value;
  let clientId = Number(document.getElementById("task-client").value);
  let date = document.getElementById("task-date").value;
  if (title && clientId && date) {
    tasks.push({ id: uuidv4(), title: title, clientId: clientId, date: date, done: false });
    saveData();
    renderAll();
    taskModal.hide();
    document.getElementById("task-form").reset();
    showToast("Seguimiento creado");
  } else {
    showToast("Completa todos los campos");
  }
}

function toggleTask(id) {
  let t = tasks.find(x => x.id == id);
  if (t) {
    t.done = !t.done;
    saveData();
    renderAll();
  }
}

function deleteTask(id) {
  if (confirm("¿Eliminar esta tarea?")) {
    tasks = tasks.filter(t => t.id != id);
    saveData();
    renderAll();
  }
}

function fillTaskClients() {
  let options = "";
  clients.forEach(c => {
    options += '<option value="' + c.id + '">' + c.name + " - " + c.company + "</option>";
  });
  document.getElementById("task-client").innerHTML = options;
}

function fakeExternalSync() {
  axios.get("https://jsonplaceholder.typicode.com/users").then(function(response) {
    console.log("External contacts loaded", response.data.length);
  }).catch(function(error) {
    console.log("External service unavailable", error);
  });
}

document.querySelectorAll("[data-view]").forEach(link => {
  link.addEventListener("click", function(event) {
    event.preventDefault();
    changeView(this.dataset.view);
  });
});
document.getElementById("new-client").addEventListener("click", openClientModal);
document.getElementById("new-client-top").addEventListener("click", openClientModal);
document.getElementById("client-form").addEventListener("submit", addClient);
document.getElementById("new-task").addEventListener("click", function() {
  fillTaskClients();
  document.getElementById("task-form").reset();
  taskModal.show();
});
document.getElementById("task-form").addEventListener("submit", addTask);
document.getElementById("client-search").addEventListener("input", renderClients);
document.getElementById("client-filter").addEventListener("change", renderClients);
document.getElementById("chart-period").addEventListener("change", function() {
  renderChart();
});

window.editClient = editClient;
window.deleteClient = deleteClient;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

loadData();
renderAll();
fakeExternalSync();
document.getElementById("today-label").innerText = moment().format("[PANEL DE CONTROL ·] dddd DD [de] MMMM");

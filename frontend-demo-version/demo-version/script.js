const API_URL = "http://127.0.0.1:5000";
let token = null;

async function register() {
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    const response = await fetch(`${API_URL}/authorization/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    alert(data.detail || "Успешная регистрация!");
}

async function login() {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const response = await fetch(`${API_URL}/authorization/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (data.access_token) {
        token = data.access_token;
        alert("Успешный вход!");
        loadNotes();
    } else {
        alert(data.detail || "Ошибка входа");
    }
}

async function loadNotes() {
    if (!token) {
        alert("Сначала войдите в систему.");
        return;
    }

    const response = await fetch(`${API_URL}/notes/all_user_notes`, {
        method: "GET",
        headers: { "authorization-client": `Bearer ${token}` }
    });

    const data = await response.json();
    if (!data.notes) {
        alert("Ошибка загрузки записей.");
        return;
    }

    const notesList = document.getElementById("notesList");
    notesList.innerHTML = "";

    data.notes.forEach(note => {
        const li = document.createElement("li");
        li.textContent = `${note.text} (Создано: ${note.created_at})`;
        li.dataset.id = note.id;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Удалить";
        deleteButton.onclick = () => deleteNote(note.id);

        li.appendChild(deleteButton);
        notesList.appendChild(li);
    });
}

async function addNote() {
    if (!token) {
        alert("Сначала войдите в систему.");
        return;
    }

    const text = document.getElementById("noteText").value;
    const response = await fetch(`${API_URL}/notes/add_note`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "authorization-client": `Bearer ${token}`
        },
        body: JSON.stringify({ text })
    });

    const data = await response.json();
    if (data.detail) {
        alert(data.detail);
    } else {
        loadNotes();
    }
}

async function deleteNote(noteId) {
    if (!token) {
        alert("Сначала войдите в систему.");
        return;
    }

    const response = await fetch(`${API_URL}/notes/delete_user_notes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "authorization-client": `Bearer ${token}`
        },
        body: JSON.stringify({ note_ids: [noteId] })
    });

    const data = await response.json();
    if (data.detail) {
        alert(data.detail);
    } else {
        loadNotes();
    }
}

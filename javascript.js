// Lista de asignaturas fijas
const subjects = [
	'Administración del tiempo',
	'Arquitectura de software',
	'Experiencia de usuario',
	'Inglés',
	'Matemáticas',
	'Metodologías de desarrollo',
	'Seguridad informática'
];

// Posibles calificaciones
const gradesOptions = [10,9,8,0];

// State
let students = []; // {name, grades: {subject: grade}, average}

// Elementos del DOM
const gradesBody = document.getElementById('grades-body');
const registerBtn = document.getElementById('register-btn');
const studentNameInput = document.getElementById('student-name');
const rankingBody = document.getElementById('ranking-body');

// Inicializar formulario con las asignaturas
function initGradesForm(){
	subjects.forEach(sub => {
		const tr = document.createElement('tr');

		const tdSubject = document.createElement('td');
		tdSubject.textContent = sub;

		const tdSelect = document.createElement('td');
		const select = document.createElement('select');
		select.classList.add('grade-select');
		select.setAttribute('data-subject', sub);

		gradesOptions.forEach(g => {
			const option = document.createElement('option');
			option.value = g;
			option.textContent = g;
			select.appendChild(option);
		});

		tdSelect.appendChild(select);
		tr.appendChild(tdSubject);
		tr.appendChild(tdSelect);
		gradesBody.appendChild(tr);
	});
}

// Calcular promedio de un objeto grades
function calculateAverage(grades){
	const vals = Object.values(grades).map(Number);
	const sum = vals.reduce((a,b)=>a+b,0);
	return vals.length ? +(sum/vals.length).toFixed(2) : 0;
}

// Registrar alumno
function registerStudent(){
	const name = studentNameInput.value.trim();
	if(!name){
		alert('Ingresa el nombre del alumno.');
		return;
	}

	// Recolectar calificaciones
	const selects = document.querySelectorAll('select.grade-select');
	const grades = {};
	selects.forEach(s => {
		const sub = s.getAttribute('data-subject');
		grades[sub] = Number(s.value);
	});

	const avg = calculateAverage(grades);

	// Crear estudiante
	const student = { name, grades, average: avg };

	// Añadir a la lista y reordenar
	const prevRanking = students.map(s => s.name);
	students.push(student);
	sortStudents();

	// Persistir en localStorage
	saveStudents();

	// Actualizar UI
	updateRanking(prevRanking);

	// Limpiar campo nombre
	studentNameInput.value = '';
}

function sortStudents(){
	students.sort((a,b)=> b.average - a.average);
}

function saveStudents(){
	try{ localStorage.setItem('students_v1', JSON.stringify(students)); } catch(e){ /* no bloqueante */ }
}

function loadStudents(){
	try{
		const raw = localStorage.getItem('students_v1');
		if(raw){
			students = JSON.parse(raw);
		}
	}catch(e){ students = []; }
}

// Actualizar tabla de clasificación con animaciones de cambio de posición
function updateRanking(prevOrder){
	// Crear nuevo tbody
	rankingBody.innerHTML = '';

	students.forEach((s, index) => {
		const tr = document.createElement('tr');
		tr.setAttribute('data-name', s.name);

		const tdPos = document.createElement('td');
		tdPos.textContent = index + 1;

		const tdName = document.createElement('td');
		tdName.textContent = s.name;

		const tdAvg = document.createElement('td');
		tdAvg.textContent = s.average.toFixed(2);

		const tdState = document.createElement('td');
		const estado = s.average >= 8 ? 'Aprobado' : 'Reprobado';
		tdState.textContent = estado;
		tdState.classList.add(s.average >= 8 ? 'status-pass' : 'status-fail');

		tr.appendChild(tdPos);
		tr.appendChild(tdName);
		tr.appendChild(tdAvg);
		tr.appendChild(tdState);

		rankingBody.appendChild(tr);
	});

	// Aplicar animaciones comparando prevOrder vs new order
	if(prevOrder && prevOrder.length){
		// Map previous positions
		const prevPositions = {};
		prevOrder.forEach((n, i)=> prevPositions[n] = i);

		// Añadir clase según si subió o bajó
		students.forEach((s, newIndex)=>{
			const tr = rankingBody.querySelector(`tr[data-name="${cssEscape(s.name)}"]`);
			const prevIndex = prevPositions[s.name];
			if(prevIndex === undefined) return; // nuevo alumno
			if(newIndex < prevIndex){
				tr.classList.add('rank-up');
				setTimeout(()=> tr.classList.remove('rank-up'), 1200);
			} else if(newIndex > prevIndex){
				tr.classList.add('rank-down');
				setTimeout(()=> tr.classList.remove('rank-down'), 1200);
			}
		});
	}
}

// utilidad: escape CSS selector para nombres con caracteres especiales
function cssEscape(str){
	return str.replace(/(["'\\])/g, '\\$1');
}

// Inicialización
function init(){
	initGradesForm();
	loadStudents();
	updateRanking([]);
}

registerBtn.addEventListener('click', registerStudent);

document.addEventListener('DOMContentLoaded', init);


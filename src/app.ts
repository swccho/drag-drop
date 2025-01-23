// Project state management
class ProjectState {
    private projects:any[] = [];
    private static instance: ProjectState;
    private constructor() {
    }
    static getInstance(){
        if (this.instance){
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }

    addProject(title:string, description:string, people:number){
        const newProject = {
            id: `${Math.random().toString()}${new Date().toISOString()}`,
            title: title,
            description: description,
            people: people,
        }
        this.projects.push(newProject);
    }
}

const projectState = ProjectState.getInstance();

// Validation interface
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

// Validation function
function validate(validatableInput:Validatable){
    let isValid = true;
    // Required
    if (validatableInput.required){
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    // Min Length
    if (validatableInput.minLength != null && typeof validatableInput.value === 'string'){
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    // Max Length
    if (validatableInput.maxLength != null && typeof validatableInput.value === 'string'){
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    // Min
    if (validatableInput.min != null && typeof validatableInput.value === 'number'){
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    // Max
    if (validatableInput.max != null && typeof validatableInput.value === 'number'){
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
}

// Auto bind decorator
function autoBind(_1: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            return originalMethod.bind(this);
        }
    }
    return adjDescriptor;
}


// ProjectList Class
class ProjectList {
    templateEl:HTMLTemplateElement;
    hostEl:HTMLDivElement;
    element: HTMLElement;

    constructor(private type: 'active' | 'finished') {
        // Accessing the template and host elements from the DOM
        this.templateEl = <HTMLTemplateElement>document.getElementById('project-list')!;
        this.hostEl = <HTMLDivElement>document.getElementById('app')!;

        // Importing the template content and assigning it to the form element
        const importedNode = document.importNode(this.templateEl.content, true);
        this.element = <HTMLElement>importedNode.firstElementChild;
        this.element.id = `${this.type}-projects`;

        this.attach();
        this.renderContent();
    }

    private renderContent(){
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + 'PROJECTS';
    }
    private attach(){
        this.hostEl.insertAdjacentElement('beforeend', this.element);
    }
}

// Form class
class ProjectForm {
    // Template element used to get the form structure from the HTML template
    templateEl: HTMLTemplateElement;
    // Host element where the form will be attached in the DOM
    hostEl: HTMLDivElement;
    // The form element itself after importing from the template
    FormEl: HTMLFormElement;

    // Input elements for title, description, and people fields
    titleInputEl: HTMLInputElement;
    descriptionInputEl: HTMLInputElement;
    peopleInputEl: HTMLInputElement;

    constructor() {
        // Accessing the template and host elements from the DOM
        this.templateEl = <HTMLTemplateElement>document.getElementById('project-input')!;
        this.hostEl = <HTMLDivElement>document.getElementById('app')!;

        // Importing the template content and assigning it to the form element
        const importedNode = document.importNode(this.templateEl.content, true);
        this.FormEl = <HTMLFormElement>importedNode.firstElementChild;
        this.FormEl.id = 'user-input';

        // Querying input elements from the form
        this.titleInputEl = <HTMLInputElement>this.FormEl.querySelector('#title')!;
        this.descriptionInputEl = <HTMLInputElement>this.FormEl.querySelector('#description')!;
        this.peopleInputEl = <HTMLInputElement>this.FormEl.querySelector('#people')!;

        // Configuring event listeners and attaching the form to the DOM
        this.configure();
        this.attach();
    }

    // Method to gather and validate user input from the form fields
    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputEl.value;
        const enteredDescription = this.descriptionInputEl.value;
        const enteredPeople = this.peopleInputEl.value;

        // Validation configuration for each input field
        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true
        };
        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        };
        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        };

        // Validating the inputs and returning the values if valid, else showing an alert
        if (
            !validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)
        ) {
            alert('Invalid Input, please try again!');
            return;
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }

    // Method to clear the input fields after form submission
    private clearInputs() {
        this.titleInputEl.value = '';
        this.descriptionInputEl.value = '';
        this.peopleInputEl.value = '';
    }

    // Form submit handler method, bound to the class instance using a decorator
    @autoBind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            console.log(userInput)
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people);
            this.clearInputs();
        }
    }

    // Method to configure event listeners on the form
    private configure() {
        this.FormEl.addEventListener('submit', this.submitHandler);
    }

    // Method to attach the form element to the host element in the DOM
    private attach() {
        this.hostEl.insertAdjacentElement('afterbegin', this.FormEl);
    }
}


const prjInput = new ProjectForm();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
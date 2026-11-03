import { faker } from "@faker-js/faker"

// URL da API 
const apiUrl = 'http://localhost:5001/api/auth/register'

// Variaveis Fixas 
const name = 'Diego';
const email = 'Diego.lima10152030@gmail.com'; 
const lastName = 'Lima'; 
const Password = 'Teste@2026AB';
const departments = [
    "Tecnologia da Informação",
    "Recursos Humanos",
    "Financeiro",
    "Comercial",
    "Suporte Técnico"
];

// Variaveis aleatórias 
const randomCpf = faker.string.numeric(11); 
const randomPhone = faker.string.numeric(11);
const randomEmail = faker.internet.email(); 
const randomDepartment = faker.helpers.arrayElement(departments);

// Teste 
describe ('Registro de Usuário', ()=> {
    
    it ('Testando nome com números', ()=> {
        cy.request({
            method: 'POST',
            url: apiUrl, 
            failOnStatusCode: false, 
            body: {"name": 'Diego67',
                    "email": email,
                    "psw": Password,
                    "psw2": Password,
                    "cpf": randomCpf,
                    "department": randomDepartment,
                    "phone": randomPhone,
                    "last_name": lastName,
                    "profile_img": "null"}
        }).as('PostUserWrongName')


        //Validações do Request 
        cy.get('@PostUserWrongName')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(422)
                expect(response.body.message).equal('Name must contain only letters')
            })
    }); 


    it ('Testando verificação de e-mail sem @', ()=> {
        cy.request({
            method: 'POST',
            url: apiUrl,
            failOnStatusCode: false,
            body: {"name": name,
                    "email": 'Diego.lima11gmail.com',
                    "psw": Password,
                    "psw2": Password,
                    "cpf": randomCpf,
                    "department": randomDepartment,
                    "phone": randomPhone,
                    "last_name": lastName,
                    "profile_img": "null"}
        }).as('PostUserWithout@')

        //Validações do Request 
        cy.get('@PostUserWithout@')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(422)
                expect(response.body.message).equal('Invalid email format')
            })
    }); 

    it('Testando cadastrar CPF com menos de 11 digitos', ()=>{
        cy.request({
            method: 'POST',
            url: apiUrl,
            failOnStatusCode: false,
            body: {"name": name,
                    "email": email,
                    "psw": Password,
                    "psw2": Password,
                    "cpf": faker.string.numeric(10),
                    "department": randomDepartment,
                    "phone": randomPhone,
                    "last_name": lastName,
                    "profile_img": "null"}
        }).as('PostUserWrongCPF')

        //Validações do Request 
        cy.get('@PostUserWrongCPF')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(422)
                expect(response.body.message).equal('CPF must contain exactly 11 digits')
            })
    }); 

    it('Testando cadastrar CPF com letras', ()=> {
        cy.request({
            method: 'POST', 
            url: apiUrl, 
            failOnStatusCode: false,
            body: {"name": name,
                    "email": email,
                    "psw": Password,
                    "psw2": Password,
                    "cpf": 'olá,mundo12',
                    "department": randomDepartment,
                    "phone": randomPhone,
                    "last_name": lastName,
                    "profile_img": "null"}
        }).as('PostUserWrongCPFwithLetters')

        //Validações do Request 
        cy.get('@PostUserWrongCPFwithLetters')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(422)
            })
    });

    it('Testando cadastrar departamento inexistente', ()=> {
        cy.request({
            method: 'POST',
            url: apiUrl, 
            failOnStatusCode: false,
            body: {"name": name,
                    "email": email,
                    "psw": Password,
                    "psw2": Password,
                    "cpf": randomCpf,
                    "department": 'Engenhar',
                    "phone": randomPhone,
                    "last_name": lastName,
                    "profile_img": "null"}
        }).as('PostUserWrongDepartment')

        //Validações do Request 
        cy.get('@PostUserWrongDepartment')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(422)
                expect(response.body.message).include('User registration failed: User validation failed: department:')
            })
    }); 

    it('Testando cadastrar telefone com menos de 11 digitos', ()=> {
        cy.request({
            method: 'POST', 
            url: apiUrl,
            failOnStatusCode: false,
            body: {"name": name,
                    "email": email,
                    "psw": Password,
                    "psw2": Password,
                    "cpf": randomCpf,
                    "department": randomDepartment,
                    "phone": faker.string.numeric(10),
                    "last_name": lastName,
                    "profile_img": "null"}
        }).as('PostUserWrongPhone')

        //Validações do Request 
        cy.get('@PostUserWrongPhone')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(422)
                expect(response.body.message).equal('Phone must contain exactly 11 digits')
            })
    }); 

    it('Testando cadastrar telefone com letras', ()=>{
        cy.request({
            method: 'POST',
            url: apiUrl,
            failOnStatusCode: false,
            body: {"name": name,
                    "email": email,
                    "psw": Password,
                    "psw2": Password,
                    "cpf": randomCpf,
                    "department": randomDepartment,
                    "phone": faker.person.firstName(11),
                    "last_name": lastName,
                    "profile_img": "null"}
        }).as('PostUserWrongPhonewithLetters')

        //Validações do Request 
        cy.get('@PostUserWrongPhonewithLetters')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(422)
            })
    });

});

describe ('Registro de usuário - Senha', ()=>{

    it('Testando cadastrar senha sem letra miniscula', ()=>{
        cy.request({
            method: 'POST',
            url: apiUrl,
            failOnStatusCode: false,
            body: {"name": name,
                    "email": email,
                    "psw": 'TESTE@2026AB',
                    "psw2": 'TESTE@2026AB',
                    "cpf": randomCpf,
                    "department": randomDepartment,
                    "phone": randomPhone,
                    "last_name": lastName,
                    "profile_img": "null"}
        }).as('PostUserWrongPswmin')


        //Validações do Request 
        cy.get('@PostUserWrongPswmin')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(422)
                expect(response.body.message).equal('Password must contain a lowercase letter')
            })
    });

});


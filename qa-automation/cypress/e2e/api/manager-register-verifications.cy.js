import { faker } from "@faker-js/faker";

// URL da API de registro de gerente
const apiUrl = 'http://localhost:5001/api/auth/register_manager'

// Variaveis Fixas
const name = 'Diego';
const lastName = 'Lima';
const Password = 'Teste@2026AB';
const email = 'Diego.lima.909090676790.teste@gmail.com'

// Variaveis aleatórias
const randomEmail = faker.internet.email(); 
const randomCpf = faker.string.numeric(11); 

// Testes
describe('Registro de gerente', () => {

    it('Testando cadastrar nome com números', ()=> {
        cy.request({
            method: 'POST',
            url: apiUrl,
            failOnStatusCode: false,
            body: {
                "name": 'Diego6767',
                "email": email,
                "psw": Password,
                "psw2": Password,
                "cpf": randomCpf,
                "last_name": lastName
            }
        }).as('PostManagerWrongName')

        //Validações do Request
        cy.get('@PostManagerWrongName')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(422)
                expect(response.body.message).include('Name must contain only letters')
            })
    });

        it('Testando cadastrar last_name com números', ()=> {
        cy.request({
            method: 'POST',
            url: apiUrl,
            failOnStatusCode: false,
            body: {
                "name": name,
                "email": email,
                "psw": Password,
                "psw2": Password,
                "cpf": randomCpf,
                "last_name": 'Lima6767'
            }
        }).as('PostManagerWrongLastname')

        //Validações do Request
        cy.get('@PostManagerWrongLastname')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(422)
                expect(response.body.message).equal('Last name must contain only letters')
            })
    });
    
    it('Testando verificação de e-mail sem o @', ()=> {
        cy.request({
            method: 'POST',
            url: apiUrl,
            failOnStatusCode: false,
            body: {
                "name": name,
                "email": 'Diego.lima.909090.teste.gmail.com',
                "psw": Password,
                "psw2": Password,
                "cpf": randomCpf,
                "last_name": lastName 
            }
        }).as('PostManagerWrongEmail')

        //Validações do Request
        cy.get('@PostManagerWrongEmail')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(422)
                expect(response.body.message).include('Invalid email format')
            })
    });

    it('Testando cadastrar CPF com menos de 11 digitos', ()=>{
            cy.request({
                method: 'POST',
                url: apiUrl,
                failOnStatusCode: false,
                body: {
                "name": name,
                "email": email,
                "psw": Password,
                "psw2": Password,
                "cpf": faker.string.numeric(10),
                "last_name": lastName 
            }
        }).as('PostManagerWrongCPF--')
    
        //Validações do Request 
        cy.get('@PostManagerWrongCPF--')
            .then((response) => {
                console.log(response)
    
                expect(response.status).equal(422)
                expect(response.body.message).equal('CPF must contain exactly 11 digits')
            })
    });
        
        it('Testando cadastrar CPF com mais de 11 digitos', ()=>{
            cy.request({
                method: 'POST',
                url: apiUrl,
                failOnStatusCode: false,
                body: {
                "name": name,
                "email": email,
                "psw": Password,
                "psw2": Password,
                "cpf": faker.string.numeric(12),
                "last_name": lastName 
            }
        }).as('PostManagerWrongCPF++')
    
        //Validações do Request 
        cy.get('@PostManagerWrongCPF++')
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
                body: {
                "name": name,
                "email": email,
                "psw": Password,
                "psw2": Password,
                "cpf": "123456789AB",
                "last_name": lastName 
            }
        }).as('PostManagerWrongCPFwithLetters')
    
        //Validações do Request 
        cy.get('@PostManagerWrongCPFwithLetters')
            .then((response) => {
                console.log(response)
    
                expect(response.status).equal(422)
                expect(response.body.message).equal('CPF must contain exactly 11 digits')
            })
    });
}); 


describe ('Registro de Gerente - Senha', ()=>{

    it('Testando cadastrar senha sem letra miniscula', ()=>{
        cy.request({
            method: 'POST',
            url: apiUrl,
            failOnStatusCode: false,
            body: {
                "name": name,
                "email": email,
                "psw": 'TESTE@2026AB',
                "psw2": 'TESTE@2026AB',
                "cpf": randomCpf,
                "last_name": lastName 
            }
        }).as('PostManagerWrongPswLowercase')

        //Validações do Request 
        cy.get('@PostManagerWrongPswLowercase')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(422)
                expect(response.body.message).equal('Password must contain a lowercase letter')
            })
    });

    it('Testando cadastrar senha sem letra maiscula', ()=>{
        cy.request({
            method: 'POST',
            url: apiUrl,
            failOnStatusCode: false,
            body: {
                "name": name,
                "email": email,
                "psw": 'teste@2026cd',
                "psw2": 'teste@2026cd',
                "cpf": randomCpf,
                "last_name": lastName 
            }
        }).as('PostManagerWrongPswUppercase')

        //Validações do Request 
        cy.get('@PostManagerWrongPswUppercase')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(422)
                expect(response.body.message).equal('Password must contain an uppercase letter')
            })
    });

    it('Testando cadastrar senha com menos de 12 caracteres', ()=>{
        cy.request({
            method: 'POST',
            url: apiUrl,
            failOnStatusCode: false,
            body: {
                "name": name,
                "email": email,
                "psw": 'Teste@2026c',
                "psw2": 'Teste@2026c',
                "cpf": randomCpf,
                "last_name": lastName 
            }
        }).as('PostManagerWrongPswLeast')

        //Validações do Request 
        cy.get('@PostManagerWrongPswLeast')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(422)
                expect(response.body.message).equal('Password must have at least 12 characters')
            })
    });

    it('Testando cadastrar senha com no máximo 128 caracteres', ()=>{

        const passwordMax128 = faker.string.alphanumeric(125) + 'Aa1@';

        cy.request({
            method: 'POST',
            url: apiUrl,
            failOnStatusCode: false,
            body: {
                "name": name,
                "email": email,
                "psw": passwordMax128,
                "psw2": passwordMax128,
                "cpf": randomCpf,
                "last_name": lastName 
            }
        }).as('PostManagerWrongPswMax')

        //Validações do Request 
        cy.get('@PostManagerWrongPswMax')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(422)
                expect(response.body.message).equal('Password must have at most 128 characters')
            })
    });

    it('Testando cadastrar senha sem caractere especial', ()=>{
        cy.request({
            method: 'POST',
            url: apiUrl,
            failOnStatusCode: false,
            body: {
                "name": name,
                "email": email,
                "psw": 'Teste202026c',
                "psw2": 'Teste202026c',
                "cpf": randomCpf,
                "last_name": lastName 
            }
        }).as('PostManagerWrongPswNoSpecialChar')

        //Validações do Request 
        cy.get('@PostManagerWrongPswNoSpecialChar')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(422)
                expect(response.body.message).equal('Password must contain a special character')
            })
    });

    it('Testando cadastrar senha sem número', ()=>{
        cy.request({
            method: 'POST',
            url: apiUrl,
            failOnStatusCode: false,
            body: {
                "name": name,
                "email": email,
                "psw": 'Teste@!!$$cd',
                "psw2": 'Teste@!!$$cd',
                "cpf": randomCpf,
                "last_name": lastName 
            }
            }).as('PostManagerWrongPswNoNumber')

        //Validações do Request 
        cy.get('@PostManagerWrongPswNoNumber')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(422)
                expect(response.body.message).equal('Password must contain a number')
            })
    });


    it('Testando cadastrar senha sem confirmação de senha', ()=>{
        cy.request({
            method: 'POST',
            url: apiUrl,
            failOnStatusCode: false,
            body: {
                "name": name,
                "email": email,
                "psw": Password,
                "psw2": '',
                "cpf": randomCpf,
                "last_name": lastName 
            }
        }).as('PostManagerWrongPswNoConfirmation')

        //Validações do Request 
        cy.get('@PostManagerWrongPswNoConfirmation')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(422)
                expect(response.body.message).include('psw2 is required')
            })
    });

        it('Testando cadastrar senha com a confirmação de senha diferente', ()=>{
        cy.request({
            method: 'POST',
            url: apiUrl,
            failOnStatusCode: false,
            body: {
                "name": name,
                "email": email,
                "psw": Password,
                "psw2": 'Teste@2026BTS',
                "cpf": randomCpf,
                "last_name": lastName 
            }
        }).as('PostManagerWrongPswNoConfirmation')

        //Validações do Request 
        cy.get('@PostManagerWrongPswNoConfirmation')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(422)
                expect(response.body.message).equal('Passwords do not match')
            })
    });
});

describe('registro de gerente - Already exists', ()=>{
    it('Testando cadastrar gerente com um e-mail já existente', ()=>{
        cy.request({
            method: 'POST',
            url: apiUrl,
            failOnStatusCode: false,
            body: {
                "name": name,
                "email": 'Diego.lima10152030.master@gmail.com',
                "psw": Password,
                "psw2": Password,
                "cpf": randomCpf,
                "last_name": lastName 
            }
        }).as('PostManagerEmailAlreadyExists')
    
        //Validações do Request 
        cy.get('@PostManagerEmailAlreadyExists')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(409)
                expect(response.body.message).equal('Email already exists')
            })
    }); 

    it('Testando cadastrar gerente com um CPF já existente', ()=>{
        cy.request({
            method: 'POST',
            url: apiUrl,
            failOnStatusCode: false,
            body: {
                "name": name,
                "email": email,
                "psw": Password,
                "psw2": Password,
                "cpf": '79857914774',
                "last_name": lastName 
            }
        }).as('PostManagerCpfAlreadyExists')

        //Validações do Request 
        cy.get('@PostManagerCpfAlreadyExists')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(409)
                expect(response.body.message).equal('CPF already exists')
            })
    });
}); 
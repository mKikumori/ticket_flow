import { faker } from "@faker-js/faker"

// URL da API 
const apiUrl = 'http://localhost:5001/api/auth/register'

// Variaveis Fixas 
const name = 'Diego';
const email = 'Diego.lima676767@gmail.com'; 
const lastName = 'Lima'; 
const Password = 'Teste@2026AB';
const departments = [
      "Comercial",
      "Marketing",
      "Facilities",
      "Engenharia",
      "Financeiro",
      "Fiscal",
      "Legal",
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
    
    it('Testando cadastrar CPF com mais de 11 digitos', ()=>{
        cy.request({
            method: 'POST',
            url: apiUrl,
            failOnStatusCode: false,
            body: {"name": name,
                    "email": email,
                    "psw": Password,
                    "psw2": Password,
                    "cpf": faker.string.numeric(12),
                    "department": randomDepartment,
                    "phone": randomPhone,
                    "last_name": lastName,
                    "profile_img": "null"}
        }).as('PostUserWrongCPF++')

        //Validações do Request 
        cy.get('@PostUserWrongCPF++')
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
                    "department": 'Outros',
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
    
    it('Testando cadastrar telefone com mais de 11 digitos', ()=> {
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
                    "phone": faker.string.numeric(12),
                    "last_name": lastName,
                    "profile_img": "null"}
        }).as('PostUserWrongPhone++')

        //Validações do Request 
        cy.get('@PostUserWrongPhone++')
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
        }).as('PostUserWrongPswLowercase')


        //Validações do Request 
        cy.get('@PostUserWrongPswLowercase')
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
            body: {"name": name,
                    "email": email,
                    "psw": 'teste@2026ab',
                    "psw2": 'teste@2026ab',
                    "cpf": randomCpf,
                    "department": randomDepartment,
                    "phone": randomPhone,
                    "last_name": lastName,
                    "profile_img": "null"}
        }).as('PostUserWrongPswUppercase')


        //Validações do Request 
        cy.get('@PostUserWrongPswUppercase')
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
            body: {"name": name,
                    "email": email,
                    "psw": 'Teste@2026A',
                    "psw2": 'Teste@2026A',
                    "cpf": randomCpf,
                    "department": randomDepartment,
                    "phone": randomPhone,
                    "last_name": lastName,
                    "profile_img": "null"}
        }).as('PostUserWrongPswLeast')


        //Validações do Request 
        cy.get('@PostUserWrongPswLeast')
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
            body: {"name": name,
                    "email": email,
                    "psw": passwordMax128,
                    "psw2": passwordMax128,
                    "cpf": randomCpf,
                    "department": randomDepartment,
                    "phone": randomPhone,
                    "last_name": lastName,
                    "profile_img": "null"}
        }).as('PostUserWrongPswMax')


        //Validações do Request 
        cy.get('@PostUserWrongPswMax')
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
            body: {"name": name,
                    "email": email,
                    "psw": 'Teste2026ABC',
                    "psw2": 'Teste2026ABC',
                    "cpf": randomCpf,
                    "department": randomDepartment,
                    "phone": randomPhone,
                    "last_name": lastName,
                    "profile_img": "null"}
        }).as('PostUserWrongPswNoSpecialChar')

        //Validações do Request 
        cy.get('@PostUserWrongPswNoSpecialChar')
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
            body: {"name": name,
                    "email": email,
                    "psw": 'Teste@ABCDEF',
                    "psw2": 'Teste@ABCDEF',
                    "cpf": randomCpf,
                    "department": randomDepartment,
                    "phone": randomPhone,
                    "last_name": lastName,
                    "profile_img": "null"}
            }).as('PostUserWrongPswNoNumber')

        //Validações do Request 
        cy.get('@PostUserWrongPswNoNumber')
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
            body: {"name": name,
                    "email": email,
                    "psw": 'Teste@2026AB',
                    "psw2": '',
                    "cpf": randomCpf,
                    "department": randomDepartment,
                    "phone": randomPhone,
                    "last_name": lastName,
                    "profile_img": "null"}
        }).as('PostUserWrongPswNoConfirmation')

        //Validações do Request 
        cy.get('@PostUserWrongPswNoConfirmation')
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
            body: {"name": name,
                    "email": email,
                    "psw": 'Teste@2026AB',
                    "psw2": 'Teste@2026CD',
                    "cpf": randomCpf,
                    "department": randomDepartment,
                    "phone": randomPhone,
                    "last_name": lastName,
                    "profile_img": "null"}
        }).as('PostUserWrongPswNoConfirmation')

        //Validações do Request 
        cy.get('@PostUserWrongPswNoConfirmation')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(422)
                expect(response.body.message).equal('Passwords do not match')
            })
    });

});


describe('registro de usuário - Already exists', ()=>{
    it('Testando cadastrar usuário com um e-mail já existente', ()=>{
        cy.request({
            method: 'POST',
            url: apiUrl,
            failOnStatusCode: false,
            body: {"name": name,
                    "email": 'Diego.lima101520304050@gmail.com',
                    "psw": Password,
                    "psw2": Password,
                    "cpf": randomCpf,
                    "department": randomDepartment,
                    "phone": randomPhone,
                    "last_name": lastName,
                    "profile_img": "null"}
        }).as('PostUserEmailAlreadyExists')
    
        //Validações do Request 
        cy.get('@PostUserEmailAlreadyExists')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(422)
                expect(response.body.message).equal('Email already exists')
            })
    }); 

    it('Testando cadastrar usuário com um CPF já existente', ()=>{
        cy.request({
            method: 'POST',
            url: apiUrl,
            failOnStatusCode: false,
            body: {"name": name,
                    "email": email,
                    "psw": Password,
                    "psw2": Password,
                    "cpf": '11111111111',
                    "department": randomDepartment,
                    "phone": randomPhone,
                    "last_name": lastName,
                    "profile_img": "null"}
        }).as('PostUserCpfAlreadyExists')

        //Validações do Request 
        cy.get('@PostUserCpfAlreadyExists')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(409)
                expect(response.body.message).equal('CPF already exists')
            })
    });
    
    it('Testando cadastrar usuário com um telefone já existente', ()=>{
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
                    "phone": '10925259508',
                    "last_name": lastName,
                    "profile_img": "null"}
        }).as('PostUserPhoneAlreadyExists')

        //Validações do Request 
        cy.get('@PostUserPhoneAlreadyExists')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(409)
                expect(response.body.message).equal('Phone already exists')
            })
    });

    it('Testando envio com body incorreto', ()=> {
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
                    "team_id": null,
                    "phone": randomPhone,
                    "last_name": lastName,
                    "profile_img": "null"}
        }).as('PostUserInvalidBody')

        //Validações do Request 
        cy.get('@PostUserInvalidBody')
            .then((response) => {
                console.log(response)

            })
    }); 

}); 
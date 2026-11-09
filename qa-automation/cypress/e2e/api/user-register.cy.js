import { faker } from "@faker-js/faker"

const apiUrl = 'http://localhost:5001/api/auth/register'

const randomName = faker.person.firstName();
const randomEmail = faker.internet.email(); 
const randomCpf = faker.string.numeric(11); 
const randomPhone = faker.string.numeric(11);
const randomLastname = faker.person.lastName(); 
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
const randomDepartment = faker.helpers.arrayElement(departments);

const userBody = {
    "name": randomName,
    "email": randomEmail,
    "psw": Password,
    "psw2": Password,
    "cpf": randomCpf,
    "department": randomDepartment,
    "phone": randomPhone,
    "last_name": randomLastname
}

describe ('Registro de Usuário', ()=> {
    
    it ('Testando usuário cadastrado com sucesso!', ()=> {
        cy.request({
            method: 'POST',
            url: apiUrl, 
            failOnStatusCode: false, 
            body: userBody
        }).as('PostUserRegistrationResult')


        //Validações do Request 
        cy.get('@PostUserRegistrationResult')
            .then((response) => {
                console.log(response)

                expect(response.status).equal(201)
                expect(response.body.message).equal('User registered successfully')
            })
}); 

}); 


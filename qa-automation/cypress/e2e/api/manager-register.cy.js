import { faker } from "@faker-js/faker"

const apiUrl = 'http://localhost:5001/api/auth/register_manager'

const randomName = faker.person.firstName();
const randomEmail = faker.internet.email(); 
const randomCpf = faker.string.numeric(11); 
const randomLastname = faker.person.lastName(); 
const Password = 'Teste@2026AB';

const userBody = {
    "name": randomName,
    "email": randomEmail,
    "psw": Password,
    "psw2": Password,
    "cpf": randomCpf,
    "last_name": randomLastname,
    "team_id": null,
    "filter": null,
    "profile_img": null
}

describe ('Registro de Gerente', ()=> {
    
    it ('Testando Gerente cadastrado com sucesso!', ()=> {
        cy.request({
            method: 'POST',
            url: apiUrl, 
            failOnStatusCode: false, 
            body: userBody
        }).as('PostManagerRegistrationResult')


        //Validações do Request 
        cy.get('@PostManagerRegistrationResult')
            .then((response) => {
                console.log(response)
            })
})

})


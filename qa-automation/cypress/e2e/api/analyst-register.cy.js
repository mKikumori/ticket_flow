import { faker } from "@faker-js/faker"; 

const apiUrl = 'http://localhost:5001/api/auth/register_analyst'

const randomName = faker.person.firstName();
const randomEmail = faker.internet.email(); 
const randomLastname = faker.person.lastName(); 
const Password = 'Teste@2026AB';

const managerBody = {
  "profile_img": null,
  "email": randomEmail,
  "psw": Password,
  "psw2": Password,
  "name": randomName,
  "last_name": randomLastname,
  "filter": null,
  "team_id": null
}

describe(('Registro de Analista'), ()=> {

    it('Testando de o registro de Analista', ()=> {
        cy.request({
            method: 'POST',
            url: apiUrl,
            failOnStatusCode: false,
            body: managerBody
        }).as('PostAnalystRegistrationResult')


        //Validações do Request 
        cy.get('@PostAnalystRegistrationResult')
            .then((response) => {
                console.log(response)
            })

    })
})

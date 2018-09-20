describe('The Home Page', () => {
	it('successfully loads', () => {
		cy.visit('/')
        cy.contains('Welcome to Trii')
        cy.contains('A project by devs101')
        cy.contains("Get Started")
	})
    it('successfully takes the user to the skill tree builder', () => {
        cy.get("#start_button").click()
        cy.url().should('include', '/skilltree')
    })
})

describe('The Skill Tree Builder', () => {
    it('successfully loads', () => {
        //open skill tree builder
        cy.visit('/#/skilltree')
        //should contain the title
        cy.contains('Trii')
        //all the buttons that should be visible and exist
        cy.get('#btn_undo').should('exist').should('be.visible')
        cy.get('#btn_redo').should('exist').should('be.visible')
        cy.get('#btn_copy').should('exist').should('be.visible')
        cy.get('#btn_paste').should('exist').should('be.visible')
        cy.get('#btn_activator').should('exist').should('be.visible')
        cy.get("#btn_settings").should('exist').should('be.visible')
        //buttons that shouldn't exist yet because we haven't opened the toolbar
        cy.get("#btn_add").should('not.exist')
        cy.get("#btn_edit").should('not.exist')
        cy.get("#btn_delete").should('not.exist')

        //settings drawer should not be visible yet yet
        cy.get("#settings_drawer").should('not.be.visible')

        //nor should the new skill dialog
        cy.get("#skill_dialog").should('not.be.visible')
    })
    it('successfully opens and closes the settings drawer', () => {
        //should open it
        cy.get("#btn_settings").click()
        cy.get("#settings_drawer").should('be.visible')
        //should close it when clicking outside
        cy.get("#btn_close_settings").click()
        cy.get("#settings_drawer").should('not.be.visible')
    })
    it('successfully opens and closes the fab', () => {
        //should open it
        cy.get("#btn_activator").should('contain', 'keyboard_arrow_up').click()
        cy.get('#btn_add').should('exist').should('be.visible')
        cy.get('#btn_delete').should('exist').should('be.visible')
        cy.get('#btn_edit').should('exist').should('be.visible')
        //should close it
        cy.get('#btn_activator').should('contain', 'close').click()
        cy.get("#btn_add").should('not.exist')
        cy.get("#btn_edit").should('not.exist')
        cy.get("#btn_delete").should('not.exist')
    })
    it('successfully opens and closes the skill dialog', () => {
        //click the things
        cy.get("#btn_activator").click()
        cy.get("#btn_add").click()

        //dialog should now be visible
        cy.get('#skill_dialog').should('be.visible')
        //clicking the close button should dismiss it
        cy.get('#btn_close_skill_dialog').click()
        cy.get('#skill_dialog').should('not.be.visible')
    })
    it('successfully adds a skill', () => {
        cy.get('#btn_add').click()
        //should correctly support typing
        cy.get('#skill_name').type('Fireball').should('have.value', 'Fireball')
        cy.get('#btn_add_skill').click()
        //should close after adding a skill
        cy.get('#skill_dialog').should('not.be.visible')
    })

    it('should display a message when trying to delete nodes when nothing is selected', () => {
        cy.get('#btn_delete').click()
        cy.get("#snackbar").should('exist').should('be.visible').should('contain', 'Please select a skill first')
    })
    it('should display a message when trying to edit nodes when nothing is selected', () => {
        cy.get('#btn_edit').click()
        cy.get('#snackbar').should('exist').should('be.visible').should('contain', 'Please select a skill first')
    })
})

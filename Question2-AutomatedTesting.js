var moment = require('moment') // require

describe('validates checkout flow', () => {
    beforeEach(()=>{
        // Assume user can navigate to the checkout page with injected token.
        cy.visit('https://online.shopping.website/checkout')
    })

    it('makes an successful order', () => {
        // Validates at least 1 item in the cart.
        cy.get('#nav-cart-count').invoke('text').then(parseInt).should('be.gt', 0)

        // Start to input user details and check validations.
        // Assume that all validations are dynamically happening on value change.
        // Validates name error with only 4 characters. 
        cy.get('#name input').type('Chri')
        cy.get('#name .error').contains('Name should contain at least 5 characters')
        cy.get('#name input').type('s')
        cy.get('#name .error').should('not.exist')

        // Lookup user address. 
        cy.get('#address input').type('338 Pitt St')
        cy.get('#address .dropdown').select('338 Pitt Street, Sydney NSW')
        
        // Input credit card number.
        // 15 digits should trigger error prompt.
        cy.get('#card_number input').type('123456789012345')
        cy.get('#card_number .error').contains('Credit card is invalid')
        cy.get('#card_number input').type('6')
        cy.get('#card_number .error').should('not.exist')

        // Assume the input field has limited to number input only.
        // Input last month should cause validation error.
        let lastMonth = moment().subtract(1, 'months').format('MMYYYY')
        let curMonth = moment().format('MMYYYY')
        cy.get('#card_expiry input').type(lastMonth)
        cy.get('#card_expiry .error').contains('Invalid expiry date')
        cy.get('#card_expiry input').clear()
        cy.get('#card_expiry input').type(curMonth)

        // Monitoring post request and validating the a successful response with order id.
        cy.intercept('POST', '/order').as('confirmOrder')
        cy.get('#submit').click()
        cy.wait('@confirmOrder').its('response.body').should('include', 'order_id')
    })

    it('mandatory fields validation ', () => {
        // Submit with empty page where user details is empty by default.
        cy.get('#submit').click()

        cy.get('#name .error').contains('Name cannot be empty')
        cy.get('#address .error').contains('Address cannot be empty')
        cy.get('#card_number .error').contains('Credit card cannot be empty')
        cy.get('#card_expiry .error').contains('Expiry date cannot be empty')
    })
})
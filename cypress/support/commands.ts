// Comandos custom de Cypress

declare global {
	namespace Cypress {
		interface Chainable {
			seedGroupConfig(config: any): Chainable<void>;
		}
	}
}

Cypress.Commands.add('seedGroupConfig', (config: any) => {
	window.localStorage.setItem('documentador_group_config', JSON.stringify(config));
});

export {};

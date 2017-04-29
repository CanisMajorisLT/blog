import { ContainerIds } from './constants';
import { a } from './elements';

export function header(): string {
    return `
        <header>
            <div class="header-inner">
                <h3>${a(ContainerIds.App, '/', `
                <div class="lb-unit-container">
                    <div class="lb-unit"></div>
                    <div class="lb-unit"></div>
                    <div class="lb-unit"></div>
                </div>`)}</h2>
                <nav>
                    <span class="about">${a(ContainerIds.Noop, 'https://github.com/CanisMajorisLT', 'Github')}</span>                    
                    <span class="about">${a(ContainerIds.App, '/about', 'About')}</span>                    
                </nav>
            </div>
        </header>
`;
}

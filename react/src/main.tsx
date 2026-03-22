import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import keycloak from "./auth/keycloak.ts";
import {ApiProvider} from "./context/ApiContext.ts";


keycloak.init({
    onLoad: 'login-required',
    pkceMethod: 'S256',
    checkLoginIframe: false
}).then((auth) => {

    if (!auth) {
        void keycloak.login()
        return;
    }

    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <ApiProvider>
                <App/>
            </ApiProvider>
        </StrictMode>,
    )
})



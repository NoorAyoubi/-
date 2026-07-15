/**
 * 🛠️ ui-helper.js - Shared DOM UI Utilities
 * Utility methods to safely build and update DOM nodes without boilerplate code.
 */
(function() {
    window.JLM = window.JLM || {};

    window.JLM.UIHelper = {
        createElement: function(tag, attributes = {}, styles = {}, children = []) {
            const el = document.createElement(tag);
            
            // Apply attributes
            for (const [key, val] of Object.entries(attributes)) {
                if (key.startsWith('on') && typeof val === 'function') {
                    // event handler
                    el.addEventListener(key.substring(2).toLowerCase(), val);
                } else if (key === 'className') {
                    el.className = val;
                } else if (key === 'id') {
                    el.id = val;
                } else {
                    el.setAttribute(key, val);
                }
            }

            // Apply styles
            for (const [key, val] of Object.entries(styles)) {
                el.style[key] = val;
            }

            // Append children
            if (children) {
                if (Array.isArray(children)) {
                    children.forEach(child => {
                        if (child) {
                            if (typeof child === 'string' || typeof child === 'number') {
                                el.appendChild(document.createTextNode(child));
                            } else {
                                el.appendChild(child);
                            }
                        }
                    });
                } else if (typeof children === 'string' || typeof children === 'number') {
                    el.textContent = children;
                } else {
                    el.appendChild(children);
                }
            }

            return el;
        },

        safeSetText: function(id, text) {
            const el = document.getElementById(id);
            if (el) {
                el.innerText = text;
                return true;
            }
            return false;
        },

        safeSetHtml: function(id, html) {
            const el = document.getElementById(id);
            if (el) {
                el.innerHTML = html;
                return true;
            }
            return false;
        }
    };
})();

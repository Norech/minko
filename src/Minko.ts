import { Component, Templates } from './Component';
import * as htmlParser from 'node-html-parser';
import { createComponentFromMonofileText } from './monofile';
import { ComponentElement } from './dom/ComponentElement';
import { NodeScope } from './dom/Node';

export class Minko {
    /**
     * @internal
     * List of all components
     */
    public _components: { [key: string]: Component; } = {};

    constructor() {
        //
    }

    /**
     * Add a component from its file
     * @param name Component name
     * @param file File path
     */
    public addComponentFromFile(name: string, file: string) {
        // Only load fs when needed to have a small support on non-NodeJS platforms.
        const { readFileSync } = require('fs');

        const code = readFileSync(file).toString();
        this._components[name] = createComponentFromMonofileText(name, code, this, file);
    }

    /**
     * Add a component from an object or a Minko monofile source code.
     * @param name Component name
     * @param source Templates
     * @see Templates interface
     */
    public addComponent(name: string, source: Templates) {
        this._components[name] = new Component(name, this, source);
    }

    /**
     * Returns if a component exists
     * @param component Component name
     */
    public hasComponent(component: string) {
        return typeof this._components[component] !== 'undefined';
    }

    /**
     * Get a component copy
     * @param component Component name
     * @throws if component is not found
     */
    public getComponent(component: string) {
        if (!this.hasComponent(component)) {
            throw `${component} > Component not found`;
        }

        const original = this._components[component];

        // Clone the object's main properties
        return new Component(original.name, this, original.templates);
    }

    /**
     * Renders a component to a string
     * @param rootComponent Component name
     * @param props Properties passed to the rendered component
     */
    public async renderToString(rootComponent: string, props: { [key: string]: any } = {}) {
        const scope: NodeScope = {
            minkoInstance: this,
            cssString: '',
        };

        // This element represents the component
        const componentHTMLElement = new htmlParser.HTMLElement(rootComponent, { ...props });

        const component = new ComponentElement(rootComponent, componentHTMLElement, scope);

        const renderedDOM = new htmlParser.HTMLElement(null as unknown as string, {});

        // We put component rendered element in rendered DOM
        renderedDOM.appendChild(await component.render());

        // We add a <style> tag at end containing every styles
        if (scope.cssString.trim().length > 0) {
            const styleTag = new htmlParser.HTMLElement('style', {});
            styleTag.set_content(scope.cssString);
            renderedDOM.appendChild(styleTag);
        }

        // We return the final string
        return renderedDOM.toString();
    }
}

# Client

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.8.

## Building Angular Components
#### Create component in client/src/app

`ng generate component <comp_name>`

This creates the four following new files and updates the app.module.ts with the new component:
- comp_name.component.css
- comp_name.component.html
- comp_name.component.spec.ts
- comp_name.component.ts

#### Add angular material to components
Use [Angular Material](https://material.angular.io/components/categories) components to add common components like lists, tables, and menus to your Angular component. *Follow the installation guide if you have not used Angular Material before.*

1. Select a component and go to the API tab. Copy the import into your app module (paste the import at the top of app.module.ts and add it to the end of the imports array). 

2. Now, go to the Examples tab. Copy the TS and HTML code from an example into your angular component. 

#### Bind attributes from TS -> HTML
Angular components are classes that have functions and attributes. The values of these attributes can be read and modified within the class definition (component.ts) and the template (component.html). 

To access attributes from the template, you need to bind to them with `{{attribute}}` so you can read the values. To trigger functions, call them with a javascript function like `(click)`. Here is an example:

*app/fruit.component.ts*
    
    export class FruitComponent {
        fruit;
        constructor() {
            this.fruit = 'apple';
        }

        changeFruit() {
            this.fruit = 'pear';
        }
    }

*app/fruit.component.html*

    <p>My favorite fruit is {{fruit}}</p>
    <button (click)="changeFruit()"></button>


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

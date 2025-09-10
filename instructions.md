## Referencias

- Usa los siguientes roles donde aplique:
  - angular-developer
  - context-manager
  - ui-ux-designer
  - architect-reviewer
  - technical-writer
  - code-reviewer
  - test-engineer
- Usa como referencia de seguimiento el archivo ./docs/DEVELOPMENT_TRACKING.md.

## Actividades

- La siguiente feature debe implementarse en el componente: libs/customer-features/src/lib/shared/components/layouts/top-menu/top-menu.component.ts
- Se debe implementar un nuevo botón al lado izquierdo del botón de darkmode, llamado "Seleccionar organización".
- Este botón deme ser similar al que se muestra a continuación y debe obtener sus elementos de .store de clients, pero se debe añadir un elemento extra que se llamará ORCA:

```html

<div class="card flex justify-center">
  <p-button type="button" [label]="selectedMember ? selectedMember.name : 'Select Member'" (onClick)="toggle($event)" styleClass="min-w-48"/>

  <p-popover #op>
    <div class="flex flex-col gap-4">
      <div>
        <span class="font-medium block mb-2">Team Members</span>
        <ul class="list-none p-0 m-0 flex flex-col">
          <li *ngFor="let member of members" class="flex items-center gap-2 px-2 py-3 hover:bg-emphasis cursor-pointer rounded-border" (click)="selectMember(member)">
            <img [src]="'https://primefaces.org/cdn/primeng/images/demo/avatar/' + member.image" style="width: 32px"/>
            <div>
              <span class="font-medium">{{ member.name }}</span>
              <div class="text-sm text-surface-500 dark:text-surface-400">{{ member.email }}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </p-popover>
</div>

```

- Al seleccionar un elemento listado, se debe persistir el valor seleccionado en el .store de clients y consumir el servicio sns/bo/schema/switch, para poder obtener finalmente el customer-token que se utilizará para setear como header en las peticiones a los servicios de orca que NO tengan el prefijo /bo/
- Al seleccionar el elemento ORCA (elemento que añadimos al listado de forma controlada), debe funcionar como un "clean" se borra el valor seleccionado en el .store de clients y se elimina el customer-token
- Recuerda usar el nuevo control-flow, el ejemplo compartido viene de documentación no actualizada de primeng

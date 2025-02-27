import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import {
  IPropertyPaneConfiguration,
  PropertyPaneToggle,
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption,
} from "@microsoft/sp-property-pane";

import {
  PropertyFieldListPicker,
  PropertyFieldListPickerOrderBy,
} from "@pnp/spfx-property-controls/lib/PropertyFieldListPicker";

import * as strings from "ReactAccordionWebPartStrings";
import ReactAccordion from "./components/ReactAccordion";
import { IReactAccordionProps } from "./components/IReactAccordionProps";
import { getSP } from "../../utils/pnpjs-config"
import { SPFI } from "@pnp/sp";
import { IField, IFieldInfo } from "@pnp/sp/fields";


export interface IReactAccordionWebPartProps {
  listId: string;
  accordionTitle: string;
  columnTitle: string;
  selectedChoice: string;
  allowZeroExpanded: boolean;
  allowMultipleExpanded: boolean;
  accordianTitleColumn: string;
  accordianContentColumn: string;
  accordianSortColumn: string;
  isSortDescending: false;
}

export default class ReactAccordionWebPart extends BaseClientSideWebPart<
  IReactAccordionWebPartProps
> {

  private _sp: SPFI;
  
  private listColumns: IPropertyPaneDropdownOption[];spfxContext
  private allListColumns: IPropertyPaneDropdownOption[];
  private columnChoices: IPropertyPaneDropdownOption[];

  private columnsDropdownDisabled = true;
  private choicesDropdownDisabled = true;

  protected async onInit(): Promise<void> {
    super.onInit();
  
    //Initialize our _sp object that we can then use in other packages without having to pass around the context.
    //  Check out pnpjsConfig.ts for an example of a project setup file.
    this._sp = getSP(this.context);
  }

  public render(): void {
    const element: React.ReactElement<IReactAccordionProps> = React.createElement(
      ReactAccordion,
      {
        listId: this.properties.listId,
        columnTitle: this.properties.columnTitle,
        selectedChoice: this.properties.selectedChoice,
        accordionTitle: this.properties.accordionTitle,
        accordianTitleColumn: this.properties.accordianTitleColumn,
        accordianContentColumn: this.properties.accordianContentColumn,
        accordianSortColumn: this.properties.accordianSortColumn,
        isSortDescending: this.properties.isSortDescending,
        allowZeroExpanded: this.properties.allowZeroExpanded,
        allowMultipleExpanded: this.properties.allowMultipleExpanded,
        displayMode: this.displayMode,
        updateProperty: (value: string) => {
          this.properties.accordionTitle = value;
        },
        onConfigure: () => {
          this.context.propertyPane.open();
        },
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }
  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  private loadColumns(): Promise<IPropertyPaneDropdownOption[]> {
    return new Promise<IPropertyPaneDropdownOption[]>(
      (
        resolve: (options: IPropertyPaneDropdownOption[]) => void,
        reject: (error) => void
      ) => {
        if (!this.properties.listId) {
          console.log("No List Selected");
          return null;
        }

        const spListColumns = this._sp.web.lists
          .getById(this.properties.listId)
          .fields.filter(
            "ReadOnlyField eq false and Hidden eq false and TypeAsString eq 'Choice'"
          )
          ();
        spListColumns.then((columnResult) => {
          const listColumns = [];
          columnResult.forEach((column) => {
            listColumns.push({
              key: column.Title,
              text: column.Title,
            });
          });
          resolve(listColumns);
        }).catch((error) => {
          reject(error);
        });
      }
    );
  }
  private loadAllColumns(): Promise<IPropertyPaneDropdownOption[]> {
    return new Promise<IPropertyPaneDropdownOption[]>(
      (
        resolve: (options: IPropertyPaneDropdownOption[]) => void,
        reject: (error) => void
      ) => {
        if (!this.properties.listId) {
          console.log("No List Selected");
          return null;
        }

        const spListColumns = this._sp.web.lists
          .getById(this.properties.listId)
          .fields.filter("ReadOnlyField eq false and Hidden eq false")
          ();
        spListColumns.then((columnResult) => {
          const listColumns = [];
          columnResult.forEach((column) => {
            listColumns.push({
              key: column.InternalName,
              text: column.Title + " - [" + column.InternalName + "]",
            });
          });
          resolve(listColumns);
        }).catch((error) => {
          reject(error);
        });
      }
    );
  }

  private loadCateogryChoices(): Promise<IPropertyPaneDropdownOption[]> {
    return new Promise<IPropertyPaneDropdownOption[]>(
      (
        resolve: (options: IPropertyPaneDropdownOption[]) => void,
        reject: (error) => void
      ) => {
        if (!this.properties.columnTitle) {
          console.log("No Columns Selected");
          return null;
        }

        const categoryField: IField = this._sp.web.lists
          .getById(this.properties.listId)
          .fields.getByInternalNameOrTitle(this.properties.columnTitle);
          
        const choices: Promise<IFieldInfo> = categoryField.select("Choices")();
        choices.then((result) => {
          // console.clear();
          // console.log(result.Choices);
          const columnChoices = [];
          result.Choices.forEach((choice) => {
            columnChoices.push({
              key: choice,
              text: choice,
            });
          });
          resolve(columnChoices);
        }).catch((error) => {
          reject(error);
        });
      }
    );
  }

  protected onPropertyPaneConfigurationStart(): void {
    this.columnsDropdownDisabled = !this.properties.listId;
    this.choicesDropdownDisabled = !this.properties.columnTitle;

    //if (this.lists) {
    //  return;
    //}

    this.context.statusRenderer.displayLoadingIndicator(
      this.domElement,
      "lists, column and choices"
    );
    if (this.properties.listId) {
      this.loadColumns().then(
        (columnOptions: IPropertyPaneDropdownOption[]): void => {
          this.listColumns = columnOptions;
          this.columnsDropdownDisabled = !this.properties.listId;
          this.context.propertyPane.refresh();
          this.context.statusRenderer.clearLoadingIndicator(this.domElement);
          this.render();
        }
      );
      this.loadAllColumns().then(
        (allcolumnOptions: IPropertyPaneDropdownOption[]): void => {
          this.allListColumns = allcolumnOptions;
          this.columnsDropdownDisabled = !this.properties.listId;
          this.context.propertyPane.refresh();
          this.context.statusRenderer.clearLoadingIndicator(this.domElement);
          this.render();
        }
      );
    }
    if (this.properties.columnTitle) {
      this.loadCateogryChoices().then(
        (choiceOptions: IPropertyPaneDropdownOption[]): void => {
          this.columnChoices = choiceOptions;
          this.choicesDropdownDisabled = !this.properties.columnTitle;
          this.context.propertyPane.refresh();
          this.context.statusRenderer.clearLoadingIndicator(this.domElement);
          this.render();
        }
      );
    }
  }

  protected onPropertyPaneFieldChanged(): void {
    if (this.properties.listId) {
      this.context.statusRenderer.displayLoadingIndicator(
        this.domElement,
        "Columns"
      );

      this.loadColumns().then(
        (columnOptions: IPropertyPaneDropdownOption[]): void => {
          // store items
          this.listColumns = columnOptions;
          // enable item selector
          this.columnsDropdownDisabled = false;
          // clear status indicator
          this.context.statusRenderer.clearLoadingIndicator(this.domElement);
          // re-render the web part as clearing the loading indicator removes the web part body
          this.render();
          // refresh the item selector control by repainting the property pane
          this.context.propertyPane.refresh();
        }
      );
      this.loadAllColumns().then(
        (allcolumnOptions: IPropertyPaneDropdownOption[]): void => {
          this.allListColumns = allcolumnOptions;
          this.columnsDropdownDisabled = !this.properties.listId;
          this.context.propertyPane.refresh();
          this.context.statusRenderer.clearLoadingIndicator(this.domElement);
          this.render();
        }
      );
    }

    if (this.properties.columnTitle) {
      this.context.statusRenderer.displayLoadingIndicator(
        this.domElement,
        "Choices"
      );
      this.loadCateogryChoices().then(
        (choiceOption: IPropertyPaneDropdownOption[]): void => {
          // store items
          this.columnChoices = choiceOption;
          // enable item selector
          this.choicesDropdownDisabled = false;
          // clear status indicator
          this.context.statusRenderer.clearLoadingIndicator(this.domElement);
          // re-render the web part as clearing the loading indicator removes the web part body
          this.render();
          // refresh the item selector control by repainting the property pane
          this.context.propertyPane.refresh();
        }
      );
    }

    if (this.properties.selectedChoice) {
      this.context.statusRenderer.displayLoadingIndicator(
        this.domElement,
        "Data"
      );
      this.context.statusRenderer.clearLoadingIndicator(this.domElement);
      this.render();
      this.context.propertyPane.refresh();
    }
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyFieldListPicker("listId", {
                  label: "Select a list",
                  selectedList: this.properties.listId,
                  includeHidden: false,
                  orderBy: PropertyFieldListPickerOrderBy.Title,
                  disabled: false,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  context: this.context as any,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: "listPickerFieldId",
                }),
                PropertyPaneDropdown("columnTitle", {
                  label: "Select the (Choice) Column for Categories.",
                  options: this.listColumns,
                  disabled: this.columnsDropdownDisabled,
                }),
                PropertyPaneDropdown("selectedChoice", {
                  label: "Select the Choice value for filter.",
                  options: this.columnChoices,
                  disabled: this.choicesDropdownDisabled,
                }),
                PropertyPaneDropdown("accordianTitleColumn", {
                  label: "Select the Column for Accordion Title Rows.",
                  options: this.allListColumns,
                  disabled: this.choicesDropdownDisabled,
                }),
                PropertyPaneDropdown("accordianContentColumn", {
                  label: "Select the Column for Accordion Content.",
                  options: this.allListColumns,
                  disabled: this.choicesDropdownDisabled,
                }),
                PropertyPaneDropdown("accordianSortColumn", {
                  label: "Select the Column for Accordion Sort Rows.",
                  options: this.allListColumns,
                  disabled: this.choicesDropdownDisabled,
                }),
                PropertyPaneToggle("isSortDescending", {
                  label: "Sort type",
                  onText: "Descending",
                  offText: "Ascending",
                  disabled: !this.properties.accordianSortColumn
                }),
                PropertyPaneToggle("allowZeroExpanded", {
                  label: "Allow zero expanded",
                  checked: this.properties.allowZeroExpanded,
                  key: "allowZeroExpanded",
                }),
                PropertyPaneToggle("allowMultipleExpanded", {
                  label: "Allow multi expand",
                  checked: this.properties.allowMultipleExpanded,
                  key: "allowMultipleExpanded",
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}

/**
 * @description - The restaurant receives array of orders, while each order is for one Pizza that contains an array of
 * toppings.
 *
 * The dough-to-pizza pipeline is:
 *    Dough chef -> Topping chef -> Oven -> Serving
 *
 * When a certain station within the pipeline is completed, the Pizza moves to the next one. There are no dependencies
 * between the orders in the arrays - when an order is ready to be served, it is being deployed to the customer.
 *
 * The restaurant personnel are:
 * - 2 dough chefs - each chef can handle single dough at a time. It takes 7 seconds per single dough.
 * - 3 topping chefs - each chef can handle 2 toppings at a time. It takes 4 seconds to put each topping on the Pizza.
 * - 1 oven that takes one pizza each time and cook it for 10 seconds.
 * - 2 waiters that serve the pizza to the customers. From the kitchen to the table it takes 5 seconds.
 *
 * Each process should print logs (start and end time).
 * In the end, when all the orders had been served, you need to print a report about the complete set of
 * orders. The report should contain:
 * - The preparation time from start to end.
 * - The preparation time for each order.
 */

import ordersJson = require('./orders.json');

// ================================================================================================================== //
// ======================================================= LOGIC ==================================================== //
// ================================================================================================================== //

const DOUGH_CHEF_PROCESSING_TIME_IN_SECONDS = 7;
const TOPPING_CHEF_PROCESSING_TIME_IN_SECONDS = 4;
const OVEN_PROCESSING_TIME_IN_SECONDS = 10;
const SERVING_PROCESSING_TIME_IN_SECONDS = 5;

export enum PersonnelEnum {
  DOUGH = 'dough',
  TOPPING = 'topping',
  'OVEN' = 'oven',
  'WAITER' = 'waiter',
}

/**
 * @description - The person class, that contains all necessary props and methods that is needed for employee
 *  availability status change and type.
 */
class Person {
  private isAvailable: boolean = true;

  public get IsAvailable(): boolean {
    return this.isAvailable;
  }

  public setIsAvailable(status: boolean): Person {
    this.isAvailable = status;
    return this;
  }

  private readonly type: PersonnelEnum;

  public get PersonnelType(): PersonnelEnum {
    return this.type;
  }

  constructor(personnelType: PersonnelEnum) {
    this.type = personnelType;
  }
}

/**
 * @description - The personnel class that initialize and contains all employees availability status
 */
class Personnel {
  private readonly employees: Person[] = [
    new Person(PersonnelEnum.DOUGH),
    new Person(PersonnelEnum.DOUGH),
    new Person(PersonnelEnum.TOPPING),
    new Person(PersonnelEnum.TOPPING),
    new Person(PersonnelEnum.TOPPING),
    new Person(PersonnelEnum.OVEN),
    new Person(PersonnelEnum.WAITER),
    new Person(PersonnelEnum.WAITER),
  ];

  public async getAvailablePerson(personnelType: PersonnelEnum, attempts = 1): Promise<number> {
    const availablePersonIndex = this.employees.findIndex(
      (personnel) => personnel.PersonnelType === personnelType && personnel.IsAvailable
    );
    if (availablePersonIndex < 0) {
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      console.warn(`
        Checking availability for process "${personnelType}" - attempt #${attempts}.
      `);
      return await this.getAvailablePerson(personnelType, attempts + 1);
    }

    this.employees[availablePersonIndex].setIsAvailable(false);

    return availablePersonIndex;
  }

  public setEmployeeAvailable(personnelIndex: number): void {
    this.employees[personnelIndex].setIsAvailable(true);
  }
}

/**
 * @description - The topping object that is responsible to initialization of one topping for the selected order and all
 *  processes.
 */
class Topping {
  private readonly name: string;

  public get Name(): string {
    return this.name;
  }

  private isCompleted: boolean = false;

  public get IsCompleted(): boolean {
    return this.isCompleted;
  }

  public setIsCompleted(status: boolean): Topping {
    this.isCompleted = status;
    return this;
  }

  constructor(toppingName: string) {
    this.name = toppingName;
  }
}

type OrderProps = {
  pizza_name: string;
  toppings: string[];
}

class Order {
  private readonly name: string;

  public get Name(): string {
    return this.name;
  }

  private readonly toppings: Topping[];

  public get Toppings(): Topping[] {
    return this.toppings;
  }

  constructor({ pizza_name, toppings }: OrderProps) {
    this.name = pizza_name;
    this.toppings = toppings.map((topping) => new Topping(topping))
  }
}

class Prm {
  private readonly order: Order;

  private readonly personnel: Personnel;
  constructor(orderProps: OrderProps, personnel: Personnel) {
    this.order = new Order(orderProps);
    this.personnel = personnel;
  }

  private async processStage(
    seconds: number,
    personnelType: PersonnelEnum,
    name: string = this.order.Name,
  ): Promise<number> {
    const availableEmployeeIndex = await this.personnel.getAvailablePerson(personnelType);
    const startTime = new Date();
    await new Promise((resolve) => {
      setTimeout(resolve, seconds * 1000);
    });
    this.personnel.setEmployeeAvailable(availableEmployeeIndex);
    const endTime = new Date();
    console.log(
      `Process ${personnelType} for "${name}" completed START TIME: ${startTime.toUTCString()} END TIME: ${endTime.toUTCString()}`
    );
    return getPreparationTime(startTime, endTime);
  }

  public async processOrder(): Promise<[number, number]> {
    const startTime = new Date();

    const doughPreparationTime = await this.processStage(DOUGH_CHEF_PROCESSING_TIME_IN_SECONDS, PersonnelEnum.DOUGH);
    const toppingsPreparationTimes = await Promise.all(this.order.Toppings.map((topping, toppingIndex) =>
      this.processStage(TOPPING_CHEF_PROCESSING_TIME_IN_SECONDS, PersonnelEnum.TOPPING, topping.Name)
    ));
    const ovenPreparationTime = await this.processStage(OVEN_PROCESSING_TIME_IN_SECONDS, PersonnelEnum.OVEN);
    const servingPreparationTime = await this.processStage(SERVING_PROCESSING_TIME_IN_SECONDS, PersonnelEnum.WAITER);

    return [
      getPreparationTime(startTime),
      [
        doughPreparationTime,
        toppingsPreparationTimes.reduce(function (a, b) { return a + b; }, 0),
        ovenPreparationTime,
        servingPreparationTime,
      ].reduce(function (a, b) { return a + b; }, 0)
    ];
  }
}

function getPreparationTime(startTime: Date, endTime: Date = new Date()) {
  // return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
  return (endTime.getTime() - startTime.getTime()) / 1000;
}

/**
 * @description - The method is the main function of the file, it is getting the orders list from orders.json file, then
 *  starting to proceed the orders based on the requirement.
 */
const main = async () => {
  const personnel = new Personnel();
  const startTime = new Date();
  console.log(`PRM process started at ${startTime.toUTCString()} for the input orders`);
  console.log(ordersJson);

  const preparationTimes = await Promise.all(ordersJson.map((order) => (new Prm(order, personnel).processOrder())));

  const endTime = new Date();
  const report = `\n\tOrders Completed at ${endTime.toUTCString()}. Total processing time is ${getPreparationTime(startTime, endTime)} s.\n
    ${ordersJson
    .map((order, index) =>
      `Total preparation time for order "${order.pizza_name}" is ${preparationTimes[index][0]}s. and total processing time is${preparationTimes[index][1]}s.`)
    .join('\n\t')}`;

  console.log(report);
}

main().then(() => console.log('DONE'));

# PRM - Pizza Restaurant Management

## Description

The restaurant receives array of orders, while each order is for one Pizza that contains an array of
toppings.
##### INPUT: The dough-to-pizza pipeline is:
- Dough chef -> Topping chef -> Oven -> Serving

When a certain station within the pipeline is completed, the Pizza moves to the next one. There are no
dependencies between the orders in the arrays - when an order is ready to be served, it is being
deployed to the customer.
<br />
<br />
##### LOGIC/CRITERIA: The restaurant personnel are:
- 2 dough chefs - each chef can handle single dough at a time. It takes 7 seconds per single dough.
- 3 topping chefs - each chef can handle 2 toppings at a time. It takes 4 seconds to put each
  topping on the Pizza.
- 1 oven that takes one pizza each time and cook it for 10 seconds.
- 2 waiters that serve the pizza to the customers. From the kitchen to the table it takes 5 seconds.
##### REPORT:
Each process should print logs (start and end time).
In the end, when all the orders had been served, you need to print a report about the complete set of
orders. The report should contain:
- The preparation time from start to end.
- The preparation time for each order.


## Installation

```bash
npm i
```

#### Running the app

Before run the app, there is need to provide the input orders, for that need to modify input JSON file
https://github.com/vladgthb/prm_logic/blob/main/src/orders.json

```bash
npm run start
```

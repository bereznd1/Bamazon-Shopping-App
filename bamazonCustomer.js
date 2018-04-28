//Require the necessary NPM packages
var mysql = require("mysql");
var inquirer = require("inquirer");

//Create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password -- this will not work as is because I removed my MySQL password for security reasons
    password: "",
    database: "bamazon"
});

//Connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;

    //Run the start function after the connection is made to prompt the user
    start();
});

//Display all the items in stock for the user & then trigger the function that will prompt them for what they wanna buy
function start() {

    connection.query("SELECT item_id, product_name, price FROM products", function (err, res) {
        if (err) throw err;

        console.log("\nCurrent Items in Stock:\n");

        for (var i = 0; i < res.length; i++) {
            console.log("ID: " + res[i].item_id + "\nProduct: " + res[i].product_name + "\nPrice: $" + res[i].price + "\n\n");
        }

        whatBuy();

    });
}

//Asks user what they wanna buy & how much of it
function whatBuy() {

    inquirer
        .prompt([
            {
                name: "id",
                type: "input",
                message: "What is the ID of the product you would like to buy?"
            },

            {
                name: "amount",
                type: "input",
                message: "How many units of this product would you like to buy?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
        .then(function (answer) {
            
            //Select the stock quantity of the item they chose
            connection.query(
                "SELECT stock_quantity FROM products WHERE ?",
                {
                    item_id: answer.id,
                },
                function (err, res) {
                    if (err) throw err;

                    //If the amount in stock is greater than or equal to the amount the user wants to buy...
                    if (res[0].stock_quantity >= answer.amount) {

                        //Update the stock quantity of that item in the DB to reflect the user's purchase
                        connection.query(
                            "UPDATE products SET ? WHERE ?",
                            [
                                {
                                    stock_quantity: res[0].stock_quantity - answer.amount
                                },

                                {
                                    item_id: answer.id
                                }

                            ],
                            function (err, res) {

                                if (err) throw err;

                                console.log("\n" + "Purchase completed.");

                            }
                        );

                        //Select the item the user wants to buy from the DB
                        connection.query(
                            "SELECT price FROM products WHERE ?",
                            {
                                item_id: answer.id,
                            },
                            function (err, res) {

                                if (err) throw err;

                                //Calculate the user's total purchase by multiplying their desired amount by that item's price
                                var total = answer.amount * res[0].price;
                                total = total.toFixed(2);
                                console.log("The total cost of your purchase is: $" + total + "\n");

                                //Ask the user if they wanna make another purchase
                                //If "yes", display all items in stock again
                                //If "no", give a thank you message
                                inquirer
                                    .prompt([
                                        {
                                            name: "nextPurchase",
                                            type: "list",
                                            message: "Would you like to make another purchase?",
                                            choices: ["Yes", "No"]
                                        }
                                    ])

                                    .then(function (answer) {

                                        if (answer.nextPurchase === "Yes") {
                                            start();
                                        }

                                        else {
                                            console.log("\nThank you for shopping with Bamazon & have a great day!")
                                        }

                                    });
                            }
                        );
                    }

                    //If the amount in stock is less than the amount the user wants to buy, ask them if they wanna make another purchase instead
                    else {
                        console.log("\n" + "Insufficient quantity! So sorry!" + "\n");

                        inquirer
                            .prompt([
                                {
                                    name: "nextPurchase",
                                    type: "list",
                                    message: "Would you like to purchase something else instead?",
                                    choices: ["Yes", "No"]
                                }
                            ])

                            .then(function (answer) {

                                if (answer.nextPurchase === "Yes") {
                                    start();
                                }

                                else {
                                    console.log("\n" + "Thank you for shopping with Bamazon & have a great day!")
                                }

                            });
                    }
                }
            );
        });
}
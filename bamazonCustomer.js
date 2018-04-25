var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "Thacarter1",
    database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;

    // run the start function after the connection is made to prompt the user
    start();
});

// function which prompts the user for what action they should take
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
            // when finished prompting, insert a new item into the db with that info
            connection.query(
                "SELECT stock_quantity FROM products WHERE ?",
                {
                    item_id: answer.id,
                },
                function (err, res) {
                    if (err) throw err;

                    if (res[0].stock_quantity >= answer.amount) {

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

                        connection.query(
                            "SELECT item_id, product_name, price FROM products WHERE ?",
                            {
                                item_id: answer.id,
                            },
                            function (err, res) {

                                if (err) throw err;

                                console.log("The total cost of your purchase is: $" + answer.amount * res[0].price + "\n");


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
                                        console.log("Thank you for shopping with Bamazon & have a great day!")
                                    }

                                });

                            }
                        );

                    }

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

// inquirer
// .prompt({
//   name: "postOrBid",
//   type: "rawlist",
//   message: "Would you like to [POST] an auction or [BID] on an auction?",
//   choices: ["POST", "BID"]
// })
// .then(function(answer) {
//   // based on their answer, either call the bid or the post functions
//   if (answer.postOrBid.toUpperCase() === "POST") {
//     postAuction();
//   }
//   else {
//     bidAuction();
//   }
// });
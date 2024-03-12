import mysql.connector
from mysql.connector import Error

import flask 
from flask import jsonify
from flask import request

import hashlib 

# ------------------------------------------------------------------------------------------------------------------

# ☆･ﾟﾟ･｡.✧ DB Connection Functionality ☆･ﾟﾟ･｡.✧

class creds:
    hostname = '127.0.0.1'
    username = 'root'
    password = 'password'
    database = 'SENIORCARE'


# Connection function
def create_con(hostname, uname, passwd, dbase):
    connection = None

    try:
        connection = mysql.connector.connect(
            host = hostname,
            user = uname,
            password = passwd,
            database = dbase
        )
        print("Connection is successful!")

    except Error as e:
        print("Connection failed with error", e)

    return connection

# ------------------------------------------------------------------------------------------------------------------

# ☆･ﾟﾟ･｡.✧ Query Functions ☆･ﾟﾟ･｡.✧

# Execute a query to read from DB (select statement)
def execute_read_myquery(connection, query):

    mycursor = connection.cursor(dictionary=True)
    rows = None

    try:
        mycursor.execute(query)
        rows = mycursor.fetchall()
        return rows
    
    except Error as e:
        print("Error is:", e)


# Execute a query to update or add or delete to db (insert or update or delete statement)
def execute_sql_myquery(connection, query, values):

    mycursor = connection.cursor()

    try:
        mycursor.execute(query, values)
        connection.commit()
        print("Query Successful!")
    
    except Error as e:
        print("Error :", e)


# Execute a query to read one column from DB (select statement)
# Use to check if floor level or room number exist for POST an PUT api
def execute_read_one_column(connection, query, column_name, user_input):

    mycursor = connection.cursor(dictionary=True)
    rows = None

    try:
        mycursor.execute(query)
        rows = mycursor.fetchall()

        # Checks every row and compares to see if level/floor exist
        exists = False
        if rows:
            for row in rows:
                if row[column_name] == user_input:
                    exists = True
                    return exists
            return exists
                
    except Error as e:
        print("Error is:", e)

# ------------------------------------------------------------------------------------------------------------------

# Create application and its set up
app = flask.Flask(__name__)

# For the purpose to see errors in browser
app.config["DEBUG"] = True 


# ------------------------------------------------------------------------------------------------------------------

# ☆･ﾟﾟ･｡.✧ Login API ☆･ﾟﾟ･｡.✧

# Hardcoded username and hashed password
masterUsername = "admin"
masterPassword = "334c7610c581966c02fee96f682eed2a131aab63f04b28113b34dee1b0decf5e" # elderpwd321

# Handles user authentication for login using the GET method
@app.route('/login', methods=['GET'])
def process_login():

    if request.authorization:

        # Encodes the pwd into bytes
        encodedpasswd = request.authorization.password.encode() 
        hashvalue = hashlib.sha256(encodedpasswd)

        if request.authorization.username == masterUsername and hashvalue.hexdigest() == masterPassword:
            return jsonify('Successfully Login!')
    
    return jsonify('Nope')

# ------------------------------------------------------------------------------------------------------------------

# ｡･:*::*:･ﾟ’☆ GET, POST, PUT, DELETE Functionality ｡･:*::*:･ﾟ’☆

# ☆･ﾟﾟ･｡.✧ GET Endpoint ☆･ﾟﾟ･｡.✧

# Available tables are : floor, room, or resident
# Create a route to retrive all rows info given id with GET method
@app.route('/<table>/all', methods=['GET'])
def get_all_from_table(table):
    print("Request Headers:", request.headers)
    
    con = create_con(creds.hostname, creds.username, creds.password, creds.database)

    sql = f"select * from {table}"
    results = execute_read_myquery(con, sql)

    return jsonify(results)


# Available tables are : floor, room, or resident
# Create a route to retrive one row info given id with GET method
@app.route('/<table>', methods=['GET'])
def get_one_from_table(table):

    con = create_con(creds.hostname, creds.username, creds.password, creds.database)

    # Creates id variable if 'id' exists in the request arguments 
    if 'id' in request.args:
        id = int(request.args['id'])
    else: 
        return "Error: No ID found!"
    
    # Retrieve all rows from the specified table and filter for a single row 
    sql = f"select * from {table}"
    all_rows = execute_read_myquery(con, sql)

    single_row_list = []
    db_id = f"{table}_id"

    for row in all_rows:
        if row[db_id] == id:
            single_row_list.append(row)
    
    return jsonify(single_row_list)

# ------------------------------------------------------------

# ☆･ﾟﾟ･｡.✧ POST Endpoint ☆･ﾟﾟ･｡.✧

# Available tables are : floor, room, or resident
# Create a route to insert one row into chosen table with POST method
@app.route('/<table>', methods=['POST'])
def insert_new_row(table):

    con = create_con(creds.hostname, creds.username, creds.password, creds.database)
    
    if request.is_json:
        new_data = request.get_json()
        
        print("Received data:", new_data)

    tables = {
        "floor": ["floor_id", "floor_level", "floor_name"],
        "room": ["room_id", "room_capacity", "room_number", "floor_id"],
        "resident": ["resident_id", "resident_firstname", "resident_lastname", "resident_age", "room_id"],
    }

    if table not in tables:
        return jsonify("No table with that name exists!")
    
    # Makes a dynamic ID based on the chosen table 
    db_id = f"{table}_id"

    # Join the column names for the chosen table 
    column_names = ", ".join(tables[table])
    no_id_column_names = ", ".join(tables[table][1:])

    # Sql query that gets all data from table for later use in checking available floors and rooms
    check_sql_room = "select * from room"
    check_sql_floor = "select * from floor"
        
        
    if table == 'room':

        # Checks if user use id column 
        if db_id in new_data:
            sql = "insert into {} ({}) values (%s, %s, %s, %s)".format(table, column_names)
            values = (new_data[db_id], new_data['room_capacity'], new_data['room_number'], new_data['floor_id'])
        
        # If no, then it will auto-increment 
        else:
            sql = "insert into {} ({}) values (%s, %s, %s)".format(table, no_id_column_names)
            values = (new_data['room_capacity'], new_data['room_number'], new_data['floor_id'])

        # Checks to see if the floor that the user inserted exist or not
        check_floor = execute_read_one_column(con, check_sql_floor, 'floor_id', new_data['floor_id'])

        if check_floor is False:
            print("Error, choose a room id that exist")

        # If it does exist, sql query to add entry will execute
        elif check_floor is True:
            execute_sql_myquery(con, sql, values)
        return jsonify({"status": "success"})
        

    elif table == 'resident':

        if db_id in new_data:
            sql = "insert into {} ({}) values (%s, %s, %s, %s, %s)".format(table, column_names)
            values = (new_data[db_id], new_data['resident_firstname'], new_data['resident_lastname'], new_data['resident_age'],  new_data['room_id'])
        
        else:
            sql = "insert into {} ({}) values (%s, %s, %s, %s)".format(table, no_id_column_names)
            values = (new_data['resident_firstname'], new_data['resident_lastname'], new_data['resident_age'],  new_data['room_id'])
    
        # Checks to see if the room that the user inserted exist or not
        check_room = execute_read_one_column(con, check_sql_room, 'room_id', new_data['room_id'])

        if check_room is False:
            print("Error, choose a room id that exist")

        elif check_room is True:
            execute_sql_myquery(con, sql, values)
        return jsonify({"status": "success"})
    

    elif table == 'floor':

            if db_id in new_data:
                sql = "insert into {} ({}) values (%s, %s, %s)".format(table, column_names)
                values = (new_data[db_id], new_data['floor_level'], new_data['floor_name'])
            
            else:
                sql = "insert into {} ({}) values (%s, %s)".format(table, no_id_column_names)
                values = (new_data['floor_level'], new_data['floor_name'])

            execute_sql_myquery(con, sql, values)

            return jsonify({"status": "success"})

# ------------------------------------------------------------------

# ☆･ﾟﾟ･｡.✧ PUT Endpoint ☆･ﾟﾟ･｡.✧

# Available tables are : floor, room, or resident
# Create a route to update info from chosen table given Id with PUT method
@app.route('/<table>', methods=['PUT'])
def update_row_from_table(table):

    con = create_con(creds.hostname, creds.username, creds.password, creds.database)
    new_data = request.get_json()

    if 'id' in request.args:
        id = int(request.args['id'])
    else: 
        return "Error: No ID found"

    tables = {
        "floor": ["floor_id", "floor_level", "floor_name"],
        "room": ["room_id", "room_capacity", "room_number", "floor_id"],
        "resident": ["resident_id", "resident_firstname", "resident_lastname", "resident_age", "room_id"],
    }

    if table not in tables:
        return jsonify("Not found")
  
    # Sql query that gets all data from table for later use in checking available floors and rooms
    check_sql_room = "select * from room"
    check_sql_floor = "select * from floor"

    # Initialize empty lists to store info later
    update_columns = []
    values = []

    for column in tables[table]:

        # For each column in user input, it adds the string for the name and placeholder into the list
        if column in new_data:
            update_columns.append(f"{column} = %s")

            values.append(new_data[column])
    
    # Creates the dynamic sql query that updates with whatever the user inputs
    # User has choice to update one column or many columns at once
    sql = f"update {table} set {', '.join(update_columns)} where {tables[table][0]} = %s"
    values.append(id)

    if table == 'room':

        if 'floor_id' in new_data:

            # Checks to see if the floor that the user updated exist or not
            check_floor = execute_read_one_column(con, check_sql_floor, 'floor_id', new_data['floor_id'])

            if check_floor is False:
                print("Error, choose a room id that exist")

            # If it does exist, sql query to add entry will execute
            elif check_floor is True:
                execute_sql_myquery(con, sql, values)
            return jsonify("Successful Update!")

        # Execute if user decide not to input floor_id
        else:
            execute_sql_myquery(con, sql, values)
        return jsonify("Successful Update!")


    elif table == 'resident':
        
        if 'room_id' in new_data:

            # Checks to see if the room that the user updated exist or not
            check_room = execute_read_one_column(con, check_sql_room, 'room_id', new_data['room_id'])

            if check_room is False:
                print("Error, choose a room id that exist")

            elif check_room is True:
                execute_sql_myquery(con, sql, values)
            return jsonify("Successful Update!")

        # Execute if user decide not to input room_id
        else:
            execute_sql_myquery(con, sql, values)
        
        return jsonify("Successful Update!")


    elif table == 'floor':
        
        execute_sql_myquery(con, sql, values)

 
    return jsonify("Successful Update!")



# ---------------------------------------------------------------

# ☆･ﾟﾟ･｡.✧ Delete Endpoint ☆･ﾟﾟ･｡.✧

# Available tables are : floor, room, or resident
# Create a route to delete one row from chosen table given id with DELETE method
@app.route('/<table>', methods=['DELETE'])
def delete_row_from_table(table):

    con = create_con(creds.hostname, creds.username, creds.password, creds.database)

    # Creates id variable if 'id' exists in the request arguments 
    if 'id' in request.args:
        id = int(request.args['id'])
    else: 
        return "Error: No ID found"
    
    # Makes a dynamic ID based on the chosen table 
    db_id = f"{table}_id"

    # Dynamic sql query that deletes a row from the chosen table based off given ID
    sql = "delete from {} where {} = %s".format(table, db_id)

    # Single element tuple 
    values = (id,)
    execute_sql_myquery(con, sql, values)

    return jsonify(f"Row with ID {id} in {table} has been deleted!")

# ------------------------------------------------------------------------------------------------------------------
app.run()
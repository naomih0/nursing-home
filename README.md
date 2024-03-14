# Nursing Home Manager Project

This project is from a previous semester's class assignment, now improved to showcase its full potential. It is an application for managing a nursing home, using operations through API requests to perform CRUD operations on three main entities: floors of the nursing home, rooms within those floors, and residents accommodated in those rooms. It uses MySQL for database management, Flask for the backend API development, and an Express/Axios/EJS/Bootstrap stack for the frontend interface.

## Features
- Nursing Home Management: Manage the operations of a nursing home by handling floors, rooms, and residents through API requests.
- MySQL Database: Utilizes MySQL for data storage and retrieval
- Flask Backend: Utilizes Flask to create APIs for handling GET, POST, PUT, and DELETE requests.
- Express/Axios/EJS/Bootstrap Frontend: Has a dynamic frontend interface using Express, Axios, EJS, and Bootstrap for seamless interaction with the backend.

## Installation/Special Circumstances 
This project uses a local MySQL database, so the project is not deployable in its current state. It will not work on other machines as it relies on the database for all aspects. interested users should watch the video/gif demo below to understand the project's functionality. Also, look at the codebase to understand the project in more detail. 

## Demo

In this project, users can log into the application. If they provide incorrect credentials, the page displays a red error message. For now, the only user is admin.
![Kapture 2024-03-13 at 02 08 56](https://github.com/naomih0/nursing-home/assets/123221320/29285272-bd9c-4b47-95bd-303ac16ce6b2)

...if they provide the correct credentials, then they will be grant access to the home page. 
![Kapture 2024-03-13 at 02 17 06](https://github.com/naomih0/nursing-home/assets/123221320/665c438c-8a8e-4801-b529-f217d096eb82)

On the home page, users are presented with options to manage the different entities of the nursing home: floors, rooms, and residents. They can  navigate to these sections either through the content on the home page or by using the navigation bar at the top of the screen. On each of the entities' pages, all the entries/data from the database are displayed. This is achieved using the GET method.
![Kapture 2024-03-13 at 22 35 22 (1)](https://github.com/naomih0/nursing-home/assets/123221320/b8a3f24f-f641-4e85-a485-d375f211953b)

Users can add an entry to the list by filling out the input boxes provided in the appropriate section. This action triggers the POST API method.
![Kapture 2024-03-13 at 19 36 46 (1)](https://github.com/naomih0/nursing-home/assets/123221320/8dc35fb0-41d7-4f05-afd4-8e4c00ae5e00)

Each entry in the list features a button that allows users to collapse or uncollapse a form. This form enables users to enter updated data for the corresponding entry. The user can update some or all of each point of data at one time. This functionality uses the PUT method. 
![Kapture 2024-03-13 at 19 37 36](https://github.com/naomih0/nursing-home/assets/123221320/e7f87376-2068-44f8-991d-c25d79d57b60)

Users can delete any entry with the delete button. This action triggers the DELETE method API.
![Kapture 2024-03-13 at 19 38 32](https://github.com/naomih0/nursing-home/assets/123221320/602f5f7e-bfb3-480b-ae1e-c339c7f059b2)

You can do all of this to all types of entities (floor, room, and residents). On floor and residents pages, users will be presented with the ability to assign a floor to each room or assign a resident to a room. This will be presented with a dropdown box containing all the current available floors/room.

This dropdown box is populated using the GET method, which retrieves the existing rooms/floors from the database. Users can then select the appropriate room/floor from the dropdown list for adding or updating a data entry.
![Kapture 2024-03-13 at 23 57 33](https://github.com/naomih0/nursing-home/assets/123221320/fb429ed1-8a7f-4bfc-9dec-3769a09bf821)

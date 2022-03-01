# README

## Distinctiveness and Complexity
&emsp; This project is a website that provides users with the latest statistics about Covid 19. It gets data to show on the webpage through free API. While the Mail project uses its API to transfer data between a web browser and the server, this project uses free API to transmit data between the server and other servers. At this point, this project is different from the other projects. Another unique feature of this project is that it uses “Chart.js” to present data graphically. The webpage shows the line graph of the total number of infected people, recovered people, and dead people. In addition to this, the page also shows the total doses of vaccine administered. Those graphs help users to understand the statistics more easily.


&emsp; Numerous features make this project more complex than the other projects of the course. First, users who are logged in can see the statistics of their own country on the MyCountry page. It is enabled by getting users to select their country when they register their accounts. Their home countries are then stored in the database, and taken out every time they log in and visit the MyCountry page. Second, users can choose either to see global data or to see data for a specific country on the index page. Since both of the data are on the same page, users do not need to reload the page when they move between global data and data for a certain country. Third, all the data on the site are updated every day, since the sources update data constantly and the website fetches data every time users visit. Therefore, users can keep up with the latest information about Covid 19.


## Content of each file
- corona directory
    - static / corona directory
        - index.js : for the index page
        - mycountry.js : for the mycountry page
        - register.js : for the register page
        - vaccine.js : for the vaccine page
        - styles.css : for all the html files
    - templates / corona directory
        - index.html : Shows global data and data for a specific country
        - layout.html : Decides the style of the navigation bar
        - login.html : Shows forms for users to log in
        - mycountry.html : Shows data about the user's home country
        - register.html : Shows forms for users to create a new account
        - vaccine.html : Shows data about vaccine candidates trialed at present
    - models.py : Defines User 

## How to run 
`python manage.py runserver`

## Additional information
&emsp; The index page and the MyCountry page show recent data, such as the number of cases confirmed yesterday or the doses administered the day before yesterday. These data could be "0" when the country has not updated its statistics yet. It is also should be noted that users can choose from 185 countries. 185 is the number of countries whose data are available in all three source servers.
###### This is assignment based project
<br>

##### Database Schema

create table admin (
id serial not null primary key,
name varchar(100) not null,
email varchar(100) not null unique,
password varchar(300) not null
);

<br>

create table users (
id serial not null primary key,
name varchar(100) not null,
email varchar(100) not null unique,
password varchar(300) not null
)

<br>


create table routes (
id serial primary key,
short_name varchar(5) not null unique,
name varchar(150) not null unique,
status int default 1
)

<br>


create table flights (
id serial primary key,
status int default 1,
source varchar(5) not null,
destination varchar(5) not null,
time bigint not null,
airline_name varchar(100) not null,
total_seats int not null,
available_seats varchar(500) not null,
booked_seats varchar(500) not null,
per_can_charge float not null
);

<br>

create table user_bookings (
id serial primary key,
user_id int not null,
	time bigint not null,
source varchar(5) not null,
	destination varchar(5) not null,
passengers varchar(200),
total_tickets int not null,
	seats_booked varchar(200) not null,
	flight_id int not null,
	price float not null,
	status int default 1,
	airline_name varchar(100) not null
)

<br>

### Dependency
project is developed using nodejs v16.15.1
and database  used is postgres v14

<br>


###### Note: Currently project database is hosted live but in future it might be possible database will be shutdown 

<br>

### Running this project
keep terminal on root directory and hit `node index.js` command

<br>

### Postman Collection link 
https://api.postman.com/collections/16941286-c121814d-e5ee-44c6-a58f-868f9e4a4bd6?access_key=PMAT-01GZTKSC8XW34GKHSZPQZTREBS



people = [
    {"name": "Harry", "house": "Gryffindor"},
    {"name": "Chi", "house": "Ravenclaw"},
    {"name": "Draco", "house": "Slytherin"}
]

def f(person):
    return person["name"]

people.sort(key=f)
print(people)

people.sort(key=lambda person: person["house"])
print(people)
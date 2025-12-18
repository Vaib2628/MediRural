const bcrypt = require('bcryptjs')
const hashPassword = async (password)=>{
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    return password;
}

const userData = [
    {
        name: "vaibhav patil",
        email: "patil@medirural.com",
        password: "123456",
        phone: "6355383255",
        address: {
            street: "Admin Office",
            city: "surat",
            state: "gujarat",
            pincode: "395001"
        },
        role: "admin"
    },
    {
        name :"Manav Patel",
        email :"manav@medirural.com",
        password : "123456",
        phone :"1234567890",
        address :{
            street : "Admin office",
            city: "bardoli",
            state: "gujarat",
            pincode: "394355"
        },
        role:"admin"
    },
    // Supplier user
    {
        name: "vaibhav patil supplier",
        email: "patil.supplier@medirural.com",
        password: "123456",
        phone: "1234567890",
        address:{
            street :"Admin Office",
            city :"surat",
            state :"gujarat",
            pincode: "395001"
        },
        role: "supplier"
    },
    {
        name: "Patel Manav supplier",
        email: "patel.supplier@medirural.com",
        password: "123456",
        phone: "1234567890",
        address:{
            street :"Admin Office",
            city :"surat",
            state :"gujarat",
            pincode: "395001"
        },
        role: "supplier"
    },
    // Customer users for testing orders
    {
        name: "John Customer",
        email: "john@example.com",
        password: "123456",
        phone: "9876543210",
        address: {
            street: "Customer Street",
            city: "surat",
            state: "gujarat",
            pincode: "395001"
        },
        role: "customer"
    },
    {
        name: "Jane Customer",
        email: "jane@example.com",
        password: "123456",
        phone: "9876543211",
        address: {
            street: "Customer Avenue",
            city: "surat",
            state: "gujarat",
            pincode: "395001"
        },
        role: "customer"
    },
    {
        name: "Bob Customer",
        email: "bob@example.com",
        password: "123456",
        phone: "9876543212",
        address: {
            street: "Customer Road",
            city: "surat",
            state: "gujarat",
            pincode: "395001"
        },
        role: "customer"
    }
];

module.exports = userData; 
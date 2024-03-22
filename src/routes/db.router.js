import { Router } from "express";
import { __dirname } from "../utils.js";
import ProductManager from "../dao/mongomanagers/productManagerMongo.js";
import CartManager from '../dao/mongomanagers/cartManagerMongo.js';
import { requireAuth, isAdmin } from "../config/authMiddleware.js"
import userManager from "../dao/mongomanagers/userManagerMongo.js";
import express from 'express';
import path from 'path';
import passport from "passport";

const cmanager = new CartManager();
const pmanager = new ProductManager()
const usmanager = new userManager();

const router = Router()

// Middleware para pasar el objeto user a las vistas
const setUserInLocals = (req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
};

// Usar el middleware en todas las rutas
router.use(setUserInLocals);

router.use('/productos', express.static(path.join(__dirname, 'public')));


router.post('/register', passport.authenticate('register', { failureRedirect: '/failedregister' }), async (req, res) => {

    res.redirect('/login')
})


router.post('/login', (req, res, next) => {
    passport.authenticate('login', async (err, user, info) => {
        try {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(400).send({ status: "error", error: "Invalid credentials" });
            }
            req.login(user, async (loginErr) => {
                if (loginErr) {
                    return next(loginErr);
                }
                req.session.user = {
                    email: user.email,
                    first_name: user.first_name,
                    age: user.age,
                    last_name: user.last_name,
                };
                return res.redirect('/productos')

            });
        } catch (error) {
            return next(error);
        }
    })(req, res, next);
});


router.delete('/empty-cart', requireAuth, async (req, res) => {
    try {
        const logUser = req.session.user;
        const user = await usmanager.getUsers(logUser.email);
        const cartId = user.cartId;
        const cart = await cmanager.removeallProductFromCart(cartId);

        res.status(200).json({ message: 'Carrito vaciado exitosamente' });
    } catch (error) {
        console.error('Error al vaciar el carrito:', error);
        res.status(500).json({ error: 'Error al vaciar el carrito' });
    }
});

router.delete('/delete-to-cart', requireAuth, async (req, res) => {
    try {
        const { productId } = req.body;

        const logUser = req.session.user;
        const user = await usmanager.getUsers(logUser.email)
        const cartId = user.cartId;

        const removeCartProduct = await cmanager.removeProductFromCart(cartId, productId);


        res.json({ success: true, message: 'Producto eliminado del carrito' });
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ message: 'Error al agregar producto al carrito' });
    }
});

router.post('/add-to-cart', requireAuth, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const logUser = req.session.user;
        const user = await usmanager.getUsers(logUser.email)
        const cartId = user.cartId

        const cart = await cmanager.getCartById(cartId);

        if (productId) {
            const id = productId;
            const productDetails = await pmanager.getProductById(productId);
            const addedProduct = await cmanager.addProductInCart(cartId, productDetails, id, quantity);
        }

        res.json({ success: true, message: 'Producto agregado al carrito' });
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ message: 'Error al agregar producto al carrito' });
    }
});

export default router
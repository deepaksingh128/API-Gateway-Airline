const { UserRepository, RoleRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const { Auth, Enums } = require('../utils/common');

const userRepo = new UserRepository();
const roleRepo = new RoleRepository();

async function create(data) {
    try {
        const user = await userRepo.create(data);
        const role = await roleRepo.getRoleByName(Enums.USER_ROLES_ENUMS.CUSTOMER);
        user.addRole(role);
        return user;
    } catch(error) {
        if(error.name == 'SequelizeValidationError' || error.name == 'SequelizeUniqueConstraintError') {
            let explaination = [];
            error.errors.forEach((err) => {
                explaination.push(err.message);
            });
            throw new AppError(explaination, StatusCodes.BAD_REQUEST);
        }
        throw new AppError('Cannot create a new user object', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function signin(data) {
    try {
        const user = await userRepo.getUserByEmail(data.email);
        if(!user) {
            throw new AppError('No user found for the given email', StatusCodes.NOT_FOUND);
        }
        const passowordMatch = Auth.checkPassword(data.password, user.password);
        if(!passowordMatch) {
            throw new AppError('Invalid password', StatusCodes.BAD_REQUEST);
        }
        const jwt = Auth.createToken({id: user.id, email: user.email});
        return jwt;
    } catch (error) {
        if(error instanceof AppError) throw error;
        throw new AppError('Something went wrong', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function isAuthenticated(token) {
    try {
        if(!token) {
            throw new AppError('Missing JWT token', StatusCodes.BAD_REQUEST);
        }
        const response = Auth.verifyToken(token);
        const user = await userRepo.get(response.id);
        if(!user) {
            throw new AppError('No user found', StatusCodes.NOT_FOUND);
        }
        return user.id;
    } catch (error) {
        if(error instanceof AppError) throw error;
        if(error.name == 'JsonWebTokenError') {
            throw new AppError('Invalid JWT token', StatusCodes.BAD_REQUEST);
        }
        if(error.name == 'TokenExpiredError') {
            throw new AppError('JWT token expired', StatusCodes.BAD_REQUEST);
        }
        throw new AppError('Something went wrong', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function addRoleToUser(data) {
    try {
        const user = await userRepo.get(data.id);
        if(!user) {
            throw new AppError('No user found for the given id', StatusCodes.NOT_FOUND);
        }
        const role = await roleRepo.getRoleByName(data.role);
        if(!role) {
            throw new AppError('No user found for the given role', StatusCodes.NOT_FOUND);
        }
        user.addRole(role);
        return user;
    } catch (error) {
        if(error instanceof AppError) throw error;
        throw new AppError('Something went wrong', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function isAdmin(id) {
    try {
        const user = await userRepo.get(id);
        if(!user) {
            throw new AppError('No user found for the given id', StatusCodes.NOT_FOUND);
        }
        const adminRole = await roleRepo.getRoleByName(Enums.USER_ROLES_ENUMS.ADMIN);
        if(!adminRole) {
            throw new AppError('No user found for the given role', StatusCodes.NOT_FOUND);
        }
        return user.hasRole(adminRole);
    } catch (error) {
        if(error instanceof AppError) throw error;
        throw new AppError('Something went wrong', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    create,
    signin,
    isAuthenticated,
    addRoleToUser,
    isAdmin
}
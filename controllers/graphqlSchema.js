const { GraphQLObjectType, GraphQLSchema, GraphQLID, GraphQLList, GraphQLString, GraphQLInt } = require('graphql');
const Purchase = require('../models/Purchase');

const PurchaseType = new GraphQLObjectType({
    name: 'Purchase',
    fields: () => ({
        id: { type: GraphQLID },
        userId: { type: GraphQLID },
        productId: { type: GraphQLID },
        transactionId: { type: GraphQLString },
        expectedDeliveryDate: { type: GraphQLString },
        actualDeliveryDate: { type: GraphQLString },
        orderPlacedDate: { type: GraphQLString },
        orderStatus: { type: GraphQLString },
        quantity: { type: GraphQLInt },
        discountId: { type: GraphQLID },
        totalMakingCost: { type: GraphQLInt },
        totalPaid: { type: GraphQLInt },
        user: {
            type: UserType,
            resolve(parent, args) {
                // Fetch the user using the User model
                // I'm assuming you have a User model analogous to your Purchase model.
                return User.findById(parent.userId);
            }
        }
    })
});

const SalesByDistrictType = new GraphQLObjectType({
    name: 'SalesByDistrict',
    fields: () => ({
        location: { type: GraphQLString },
        totalSales: { type: GraphQLInt }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        salesByDistrict: {
            type: new GraphQLList(SalesByDistrictType),
            resolve(parent, args) {
                return Purchase.aggregate([
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userId',
                            foreignField: 'id',
                            as: 'user'
                        }
                    },
                    { $unwind: '$user' },
                    {
                        $group: {
                            _id: '$user.location',
                            totalSales: { $sum: '$quantity' }
                        }
                    },
                    { $sort: { totalSales: -1 } }
                ]).then(results => {
                    return results.map(result => ({
                        location: result._id,
                        totalSales: result.totalSales
                    }));
                });
            }
        }
    }
});


module.exports = new GraphQLSchema({
    query: RootQuery
});

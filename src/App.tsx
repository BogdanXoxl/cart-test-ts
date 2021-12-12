import {FC} from 'react';
import {useState} from "react";
import {useQuery} from "react-query";
//Components
import Drawer from '@material-ui/core/Drawer';
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import Badge from '@material-ui/core/Badge';
import {AddShoppingCart} from "@material-ui/icons";
import Item from './components/Item';
//Styles
import {StyledButton, Wrapper} from "./App.styles";
import Cart from "./components/Cart";
//Types
export type CartItemType = {
    id:number;
    category:string;
    description:string;
    image:string;
    price:number;
    title:string;
    amount:number;
};


const getProducts = async ():Promise<CartItemType[]> =>
    await (await fetch('https://fakestoreapi.com/products/')).json();


const App:FC = () => {
    const {data, isLoading, error} = useQuery<CartItemType[]>('products', getProducts);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [cartItems, setCartItems] = useState<CartItemType[]>([]);

    const getTotalItems = (items: CartItemType[]) =>
        items.reduce((ack: number, item) => ack+item.amount, 0);
    const handleAddToCart = (clickedItem: CartItemType) => {
        setCartItems(prev => {
            const itemInCart = prev.find((item) => item.id === clickedItem.id);
            if(itemInCart)
                return prev.map(item => item.id === clickedItem.id
                    ? {...item, amount: item.amount + 1}
                    : {...item});
            return [...prev, {...clickedItem, amount: 1}];
        });
    };
    const handleRemoveFromCart = (id: number) => {
        setCartItems(prev => (
            prev.reduce((ack, item) => {
                    if (item.id === id)
                        if (item.amount === 1)
                            return ack;
                        else
                            return [...ack, {...item, amount: item.amount - 1}];
                    else
                        return [...ack, item]
                }, [] as CartItemType[]
            )
        ));
    };

    if(isLoading) return <LinearProgress/>
    if(error) return <div>Something went wrong...</div>

    return (
        <Wrapper>
            <Drawer anchor='right' open={isOpen} onClose={() => setIsOpen(false)}>
                <Cart cartItems={cartItems} addToCart={handleAddToCart} removeFromCart={handleRemoveFromCart}/>
            </Drawer>
            <StyledButton onClick={() => setIsOpen(true)}>
                <Badge badgeContent={getTotalItems(cartItems)} color='error'>
                    <AddShoppingCart/>
                </Badge>
            </StyledButton>
          <Grid container spacing={3}>
              {data?.map(item => (
                  <Grid item key={item.id} xs={12} sm={3}>
                    <Item item={item} handleAddToCart={handleAddToCart}/>
                  </Grid>
              ))}
          </Grid>
        </Wrapper>
    );
};

export default App;

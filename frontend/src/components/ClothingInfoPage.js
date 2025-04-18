import { Button, Card, CardContent, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ClothingInfoPage = () => {
    const [clothingItem, setClothingItem] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const { id } = useParams(); // get clothing item ID from route param (e.g., /clothing/1)

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            setErrorMessage('No authentication token found');
            return;
        }

        fetch(`/api/clothing/${id}`, {
            headers: {
                'Authorization': `Token ${token}`,
            },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch clothing data');
                }
                return res.json();
            })
            .then((data) => {
                setClothingItem(data);
            })
            .catch((err) => {
                setErrorMessage(err.message);
            });
    }, [id]);

    const handleBack = () => {
        navigate('/');
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h1>Clothing Item Info</h1>

            {errorMessage && (
                <Typography color="error" style={{ marginBottom: '20px' }}>
                    {errorMessage}
                </Typography>
            )}

            {clothingItem ? (
                <Card>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            {clothingItem.name}
                        </Typography>
                        <Typography>Type: {clothingItem.type}</Typography>
                        <Typography>Color: {clothingItem.color}</Typography>
                        <Typography>Size: {clothingItem.size}</Typography>

                    </CardContent>
                </Card>
            ) : !errorMessage ? (
                <Typography>Loading clothing data...</Typography>
            ) : null}

            <Button
                variant="contained"
                color="primary"
                onClick={handleBack}
                style={{ marginTop: '20px' }}
            >
                Back to Main
            </Button>
        </div>
    );
};

export default ClothingInfoPage;
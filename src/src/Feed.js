import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Card, CardContent, Typography, Chip, Stack, Button, Box, Grid, Container } from '@mui/material';

const FeedWrapper = styled(Container)`
	padding-top: ${({ theme }) => `${theme.spacing * 4}px`};
	padding-bottom: ${({ theme }) => `${theme.spacing * 4}px`};
`;

const Feed = ({
	selectedEntry,
	items
}) => {
	useEffect(() => {
	}, []);

	return (
		<FeedWrapper maxWidth="lg" sx={{ minWidth: '700px' }}>
			<Typography variant="h4" gutterBottom>Feed</Typography>
			<Typography variant="subtitle1" gutterBottom>
				{selectedEntry.name ? (
					<>
						Filtered by category: <Chip label={selectedEntry.name} size="small" sx={{ fontWeight: 'bold', color: 'blue' }} />
					</>
				) : 'Showing all items'}
			</Typography>
			<Grid container rowSpacing={2} columnSpacing={1}>
				{items
					.sort((a, b) => b.final_score - a.final_score)
					.filter(item => !selectedEntry.name || item.category === selectedEntry.name)
					.map((item, index) => (
						<Grid item xs={12} sm={6} md={4} key={index}>
							<Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
								<CardContent sx={{ flexGrow: 1 }}>
									<Typography 
										variant="subtitle2" 
										color="text.secondary" 
										gutterBottom 
										sx={{ 
											textTransform: 'uppercase', 
											fontSize: '0.8rem',
											display: 'flex',
											justifyContent: 'space-between'
										}}
									>
										<span>
											{item.category} - {item.final_score.toFixed(2)}
										</span>
										<span
											style={{
												fontWeight: 'bold',
												color: item.change === 'increased' ? 'red' : item.change === 'decreased' ? 'blue' : 'inherit'
											}}
										>
											{item.change === 'increased' && '↑'}
											{item.change === 'decreased' && '↓'}
											{item.change === 'no change' && '→'}
										</span>
									</Typography>
									<Typography variant="h6" sx={{ lineHeight: 1.2 }} gutterBottom>{item.title}</Typography>
									<Stack 
										direction="row" 
										spacing={0.5} 
										sx={{ 
											mb: 1, 
											flexWrap: 'wrap', 
											gap: '4px' 
										}}
									>
										{item.topics.map((topic, topicIndex) => (
											<Chip
												key={topicIndex}
												label={topic}
												size="small"
												sx={{
													fontFamily: 'PT Sans Narrow',
													borderRadius: '4px',
													margin: '0 !important',
													marginLeft: '0 !important'
												}}
											/>
										))}
									</Stack>
									<Box sx={{ position: 'relative', mt: 1 }}>
										<Typography
											variant="body2"
											sx={{
												lineHeight: 1.3,
												height: '2.6em',  // Approximately 2 lines
												overflow: 'hidden',
												'&::after': {
													content: '""',
													position: 'absolute',
													bottom: 0,
													right: 0,
													width: '25%',
													height: '1.3em',
													background: 'linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1) 50%)',
												},
											}}
										>
											{item.body}
										</Typography>
										<Typography
											component="a"
											href={item.fullArticleUrl}
											variant="body2"
											sx={{
												position: 'absolute',
												bottom: 0,
												right: 0,
												color: 'primary.main',
												textDecoration: 'none',
												cursor: 'pointer',
												backgroundColor: 'white',
												paddingLeft: '4px',
												'&:hover': {
													textDecoration: 'underline',
												},
											}}
										>
											...more
										</Typography>
									</Box>
								</CardContent>
							</Card>
						</Grid>
					))}
			</Grid>
		</FeedWrapper>
	);
}

export default Feed;

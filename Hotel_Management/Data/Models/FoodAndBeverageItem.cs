﻿namespace Data.Models
{
	public class FoodAndBeverageItem
	{
		public int Id { get; set; }
		public string Name { get; set; }
        public string Category { get; set; }
        public decimal Price { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public bool IsAvailable { get; set; }
    }
}

const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
      include: [{ model: Category }, { model: Tag, through: ProductTag, as: "tagIds" }],
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag, through: ProductTag, as: "tagIds" }],
    });
    if (!productData) {
      res.status(400).json({ message: "There is no product with this id" });
      return;
    }
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json({message: "A new product has been posted"}))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.put("/:id", async (req, res) => {
  try {
      const productData = await Product.update(req.body, {
          where: {
              id: req.params.id,
          },
      })
      if (!productData) {
          res.status(400).json({ message: "No product with that id found" });
          return;
      }

      const productTagData = await ProductTag.findAll({
          where: {
              product_id: req.params.id,
          },
      })

      const productTagIds = productTagData.map(({tag_id}) => tag_id);
      const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
              return {
                  product_id: req.params.id,
                  tag_id,
              };
          });

      const productTagsToRemove = productTagData
          .filter(({tag_id}) => !req.body.tagIds.includes(tag_id))
          .map(({id}) => id);

      const newProductTagData = await Promise.all([
          ProductTag.destroy({where: {id: productTagsToRemove}}),
          ProductTag.bulkCreate(newProductTags),
      ]);

      res.status(200).json({
        message: `Product with id:${req.params.id} updated`,
      });

  } catch (err) {
      res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const productData = await Product.destroy({
      where: {
        id: req.params.id,
      },
    })
    if (!productData) {
      res.status(400).json({ message: "There is no product with that id" });
      return;
    };
    res.status(200).json({ message: `Product with id:${req.params.id} has been deleted` });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

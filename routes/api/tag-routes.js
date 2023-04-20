const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

router.get('/', async (req, res) => {
  try{
    const tagData = await Tag.findAll({
      include: [{model: Product, through: ProductTag, as: "productIds"}],
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try{
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{model: Product, through: ProductTag, as: "productIds"}],
    });
    if (!tagData) {
      res.status(400).json({message: "There is no tag with that id"})
      return;
    };
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  try{
    const tagData = await Tag.create(req.body);
    res.status(200).json(tagData);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  try{
    const tagData = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      }
    });
    if (!tagData[0]) {
      res.status(400).json({message: "There is no tag with that id"});
      return;
    }
    res.status(200).json({message: `Tag with id:${req.params.id} has been updated`})
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try{
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });
    if(!tagData) {
      res.status(400).json({message: "There is no Tag with that id"});
      return;
    }
    res.status(200).json({message: `Tag with id:${req.params.id} has been deleted`})
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

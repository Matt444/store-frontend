import { Button, Form, Row, Col } from "react-bootstrap";
import DropdownMultiselect from "react-multiselect-dropdown-bootstrap";
import DatePicker from "react-date-picker";
import { Formik, useFormikContext, useField } from "formik";
import * as yup from "yup";

import request from "../../helpers/request";

const DatePickerField = ({ ...props }) => {
    const { setFieldValue } = useFormikContext();
    const [field] = useField(props);
    return (
        <DatePicker
            {...field}
            {...props}
            selected={(field.value && new Date(field.value)) || null}
            onChange={(val) => {
                setFieldValue(field.name, val);
            }}
        />
    );
};

const DropdownMultiselectField = ({ ...props }) => {
    const { setFieldValue } = useFormikContext();
    const [field] = useField(props);
    return (
        <DropdownMultiselect
            {...field}
            {...props}
            handleOnChange={(val) => {
                setFieldValue(field.name, val);
            }}
        />
    );
};

export const AddGameForm = ({ setGameAdded, allCategories, allPlatforms, updateGames }) => {
    const schema = yup.object({
        name: yup.string().required("Name is required"),
        quantity: yup.number().required("Quantity is required").moreThan(-0.0000000001),
        price: yup.number().required("Price is required").moreThan(-0.0000000001),
        age: yup.string().required("Age is required"),
        categories: yup.array().min(1).required("Categories are required"),
        platform: yup.string().required("Platform is required"),
        date: yup.date().required("Date is required"),
    });

    return (
        <Formik
            initialValues={{
                name: "",
                quantity: "",
                price: "",
                description: "",
                age: "",
                categories: [],
                platform: "",
                date: new Date(),
            }}
            onSubmit={async (values, errors) => {
                setGameAdded(false);

                let categories_id = [];
                values.categories.map(
                    (name) =>
                        (categories_id = categories_id.concat(
                            allCategories.map((cat) => (cat.name === name ? cat.id : undefined))
                        ))
                );
                categories_id = categories_id.filter((x) => x !== undefined);
                console.log(categories_id);

                let is_digital = 1;
                if (values.quantity && values.quantity > 0) {
                    is_digital = 0;
                }

                try {
                    const { status } = await request.post("/addgame", {
                        name: values.name,
                        price: values.price,
                        quantity: values.quantity,
                        description: values.description,
                        release_date: "default",
                        is_digital: is_digital,
                        platform_id: values.platform,
                        age_category: values.age,
                        categories: categories_id,
                        "release-date": values.date.toString(),
                    });

                    if (status === 201) {
                        setGameAdded(true);
                    }
                } catch (error) {
                    errors.setFieldError("err", "Wystąpił błąd");
                    console.warn(error);
                }
            }}
            validationSchema={schema}
        >
            {({ handleSubmit, handleChange, values, isValid, errors, touched }) => (
                <Form className="mb-2" onSubmit={(e) => e.preventDefault()}>
                    <Row>
                        <Col lg={6} className="mb-2">
                            <Form.Control
                                name="name"
                                type="text"
                                placeholder="Nazwa"
                                value={values.name}
                                onChange={handleChange}
                                isInvalid={touched.name && !!errors.name}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.name}
                            </Form.Control.Feedback>
                        </Col>
                        <Col lg={2} className="mb-2">
                            <Form.Control
                                name="price"
                                type="text"
                                placeholder="Cena (zł)"
                                value={values.price}
                                onChange={handleChange}
                                isInvalid={touched.price && !!errors.price}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.price}
                            </Form.Control.Feedback>
                        </Col>
                        <Col lg={4} className="mb-2">
                            <Form.Control
                                name="quantity"
                                type="text"
                                placeholder="Ilość wersji pudełkowej"
                                value={values.quantity}
                                onChange={handleChange}
                                isInvalid={touched.quantity && !!errors.quantity}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.quantity}
                            </Form.Control.Feedback>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={3}>
                            {allCategories.length === 0 ? null : (
                                <DropdownMultiselectField
                                    name="categories"
                                    buttonClass="mb-2 dropdownmulti-light"
                                    placeholder="Kategorie"
                                    options={allCategories.map((i) => i.name)}
                                />
                            )}
                            {touched.categories && errors.categories ? (
                                <p className="text-danger" style={{ fontSize: "80%" }}>
                                    {errors.categories}
                                </p>
                            ) : null}

                            <Form.Control
                                name="platform"
                                as="select"
                                className="mr-sm-2 mb-2"
                                custom
                                onChange={handleChange}
                            >
                                <option value="">Platforma</option>
                                {allPlatforms.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name.toUpperCase()}
                                    </option>
                                ))}
                            </Form.Control>
                            {touched.platform && errors.platform ? (
                                <p className="text-danger" style={{ fontSize: "80%" }}>
                                    {errors.platform}
                                </p>
                            ) : null}
                        </Col>
                        <Col lg={3}>
                            <Form.Control
                                name="age"
                                as="select"
                                className="mr-sm-2 mb-2"
                                custom
                                onChange={handleChange}
                            >
                                <option value="">Wiek</option>
                                <option value="PEGI3">PEGI3</option>
                                <option value="PEGI4">PEGI4</option>
                                <option value="PEGI6">PEGI6</option>
                                <option value="PEGI7">PEGI7</option>
                                <option value="PEGI11">PEGI11</option>
                                <option value="PEGI12">PEGI12</option>
                                <option value="PEGI15">PEGI15</option>
                                <option value="PEGI14">PEGI14</option>
                                <option value="PEGI16">PEGI16</option>
                                <option value="PEGI18">PEGI18</option>
                            </Form.Control>
                            {touched.age && errors.age ? (
                                <p className="text-danger" style={{ fontSize: "80%" }}>
                                    {errors.age}
                                </p>
                            ) : null}

                            <DatePickerField
                                className="calendar mb-2"
                                name="date"
                                value={values.date}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.date}
                            </Form.Control.Feedback>
                        </Col>

                        <Col lg={6} className="mb-2">
                            <Form.Control
                                as="textarea"
                                style={{ height: "100%" }}
                                rows={2}
                                name="description"
                                placeholder="Opis"
                                value={values.description}
                                onChange={handleChange}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.description}
                            </Form.Control.Feedback>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={2} className="offset-lg-10 mb-2">
                            <Button
                                className="w-100"
                                type="submit"
                                variant="dark"
                                onClick={handleSubmit}
                            >
                                Dodaj
                            </Button>
                        </Col>
                    </Row>
                    {errors.err ? <p className="text-danger">{errors.err}</p> : null}
                </Form>
            )}
        </Formik>
    );
};

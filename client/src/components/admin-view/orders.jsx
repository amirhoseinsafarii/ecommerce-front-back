import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";
import * as XLSX from "xlsx";
import { toast } from "sonner";

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { orderList, orderDetails, isLoading } = useSelector(
    (state) => state.adminOrder
  );
  const dispatch = useDispatch();
  const [expo, setExpo] = useState(false);
  const [exportingOrderId, setExportingOrderId] = useState(null);

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetailsForAdmin(getId));
  }

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  console.log(orderDetails, "orderList");

  useEffect(() => {
    if (orderDetails !== null && expo === false) setOpenDetailsDialog(true);
  }, [orderDetails]);

  // Watch for orderDetails changes when exporting
  useEffect(() => {
    if (exportingOrderId && orderDetails && !isLoading) {
      try {
        // Prepare order details data
        const orderData = {
          "Order ID": orderDetails._id,
          "Order Date": orderDetails.orderDate.split("T")[0],
          "Order Status": orderDetails.orderStatus,
          "Total Amount": `$${orderDetails.totalAmount}`,
          "Customer Name": orderDetails.shippingAddress?.fullName || "N/A",
          Email: orderDetails.shippingAddress?.email || "N/A",
          Phone: orderDetails.shippingAddress?.phone || "N/A",
          Address: orderDetails.shippingAddress?.address || "N/A",
          City: orderDetails.shippingAddress?.city || "N/A",
          Country: orderDetails.shippingAddress?.country || "N/A",
          "Postal Code": orderDetails.shippingAddress?.postalCode || "N/A",
        };

        // Prepare products data
        const productsData =
          orderDetails.orderItems?.map((item) => ({
            "Product Name": item.name,
            Quantity: item.quantity,
            Price: `$${item.price}`,
            Total: `$${item.price * item.quantity}`,
          })) || [];

        // Create workbook and worksheets
        const wb = XLSX.utils.book_new();

        // Order Details Sheet
        const orderWS = XLSX.utils.json_to_sheet([orderData]);
        XLSX.utils.book_append_sheet(wb, orderWS, "Order Details");

        // Products Sheet
        const productsWS = XLSX.utils.json_to_sheet(productsData);
        XLSX.utils.book_append_sheet(wb, productsWS, "Products");

        // Save the file
        XLSX.writeFile(wb, `Order-${exportingOrderId}.xlsx`);
        toast.success("Excel file exported successfully!");
      } catch (error) {
        console.error("Error exporting to Excel:", error);
        toast.error("Failed to export Excel file. Please try again.");
      } finally {
        setExportingOrderId(null);
        setExpo(false);
        dispatch(resetOrderDetails());
      }
    }
  }, [orderDetails, exportingOrderId, isLoading, dispatch]);

  const handleExcelExport = async (orderId) => {
    setExpo(true);
    setExportingOrderId(orderId);
    dispatch(getOrderDetailsForAdmin(orderId));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Order Price</TableHead>
              <TableHead>
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderList && orderList.length > 0
              ? orderList.map((orderItem) => (
                  <TableRow key={orderItem._id}>
                    <TableCell>{orderItem?._id}</TableCell>
                    <TableCell>{orderItem?.orderDate.split("T")[0]}</TableCell>
                    <TableCell>
                      <Badge
                        className={`py-1 px-3 ${
                          orderItem?.orderStatus === "confirmed"
                            ? "bg-green-500"
                            : orderItem?.orderStatus === "rejected"
                            ? "bg-red-600"
                            : "bg-black"
                        }`}
                      >
                        {orderItem?.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>${orderItem?.totalAmount}</TableCell>
                    <TableCell className="flex justify-around">
                      <Dialog
                        open={openDetailsDialog}
                        onOpenChange={() => {
                          setOpenDetailsDialog(false);
                          dispatch(resetOrderDetails());
                        }}
                      >
                        <Button
                          onClick={() =>
                            handleFetchOrderDetails(orderItem?._id)
                          }
                        >
                          View Details
                        </Button>
                        <AdminOrderDetailsView orderDetails={orderDetails} />
                      </Dialog>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleExcelExport(orderItem._id);
                        }}
                        disabled={exportingOrderId === orderItem._id}
                      >
                        {exportingOrderId === orderItem._id
                          ? "Exporting..."
                          : "Excel Export"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default AdminOrdersView;

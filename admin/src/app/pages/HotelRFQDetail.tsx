import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rfqService } from '../services/rfqService';
import { HotelRequest, StructuredQuote } from '../types/shared.types';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export function HotelRFQDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [request, setRequest] = useState<HotelRequest | null>(null);
    const [loading, setLoading] = useState(true);

    // Pricing State
    const [pricing, setPricing] = useState<StructuredQuote>({
        roomCost: 0,
        foodCost: 0,
        conferenceCost: 0,
        transportCost: 0,
        taxes: 0,
        serviceCharges: 0,
        extraCharges: 0,
        discountOffered: 0,
        basePrice: 0,
        finalBasePrice: 0
    });

    const [taxPercent, setTaxPercent] = useState<number>(0);
    const [servicePercent, setServicePercent] = useState<number>(0);

    useEffect(() => {
        if (id) {
            loadRequest(id);
        }
    }, [id]);

    const loadRequest = async (reqId: string) => {
        const res = await rfqService.getRequestById(reqId);
        if (res.success && res.data) {
            setRequest(res.data);
            if (res.data.quote_details) {
                const details = res.data.quote_details;
                setPricing(details);

                // Back-calculate percentages if possible
                const subtotal =
                    Number(details.roomCost) +
                    Number(details.foodCost) +
                    Number(details.conferenceCost) +
                    Number(details.transportCost);

                if (subtotal > 0) {
                    setTaxPercent(Number(((details.taxes / subtotal) * 100).toFixed(2)));
                    setServicePercent(Number(((details.serviceCharges / subtotal) * 100).toFixed(2)));
                }
            }
        }
        setLoading(false);
    };

    const calculateTotals = (current: StructuredQuote, tPct?: number, sPct?: number) => {
        const subtotal =
            Number(current.roomCost) +
            Number(current.foodCost) +
            Number(current.conferenceCost) +
            Number(current.transportCost);

        const currentTaxPct = tPct !== undefined ? tPct : taxPercent;
        const currentServicePct = sPct !== undefined ? sPct : servicePercent;

        const calculatedTaxes = (subtotal * currentTaxPct) / 100;
        const calculatedService = (subtotal * currentServicePct) / 100;

        const base =
            subtotal +
            calculatedTaxes +
            calculatedService +
            Number(current.extraCharges);

        const final = base - Number(current.discountOffered);

        return {
            ...current,
            taxes: calculatedTaxes,
            serviceCharges: calculatedService,
            basePrice: base,
            finalBasePrice: final
        };
    };

    const handlePriceChange = (field: keyof StructuredQuote, value: string) => {
        const numValue = parseFloat(value) || 0;
        const newPricing = { ...pricing, [field]: numValue };
        setPricing(calculateTotals(newPricing));
    };

    const handlePercentageChange = (type: 'tax' | 'service', value: string) => {
        const numValue = parseFloat(value) || 0;
        if (type === 'tax') {
            setTaxPercent(numValue);
            setPricing(calculateTotals(pricing, numValue, servicePercent));
        } else {
            setServicePercent(numValue);
            setPricing(calculateTotals(pricing, taxPercent, numValue));
        }
    };

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    };

    const handleSubmitQuote = async () => {
        if (!id) return;
        const totals = calculateTotals(pricing);
        console.log('Submitting quote with data:', { id, totals });
        const result = await rfqService.submitQuote(id, totals);
        if (result.success) {
            alert('Quote submitted successfully!');
            loadRequest(id);
        } else {
            alert(`Failed to submit quote: ${result.error}`);
            console.error('Quote submission error:', result.error);
        }
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString("en-IN")}`;
    };

    if (loading) return <div>Loading details...</div>;
    if (!request) return <div>Request not found</div>;

    const trip = request.trip;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">RFQ: {trip?.destination}</h1>
                    <p className="text-gray-500">Trip ID: {trip?.id?.substring(0, 8)}</p>
                </div>
                <div className="text-right">
                    <StatusBadge status={request.status} />
                    <p className="text-sm text-gray-500 mt-1">Status: {request.status}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Trip Details */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="font-semibold mb-4 border-b pb-2">Trip Requirements</h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <span className="text-gray-500 block">Dates</span>
                                <span className="font-medium">{trip?.start_date ? new Date(trip.start_date).toLocaleDateString() : 'N/A'} - {trip?.end_date ? new Date(trip.end_date).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Travelers</span>
                                <span className="font-medium">{trip?.travelers} People</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Budget</span>
                                <span className="font-medium">{formatCurrency(trip?.budget || 0)} (Total)</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Description</span>
                                <p className="text-gray-700 mt-1">{trip?.description || trip?.form_data?.description || 'No description provided.'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Special Requests</span>
                                <ul className="list-disc list-inside mt-1 text-gray-700">
                                    {trip?.form_data?.dietaryRestrictions?.map((d: string) => <li key={d}>{d}</li>)}
                                    {trip?.form_data?.accommodationPreferences?.map((a: string) => <li key={a}>{a}</li>)}
                                </ul>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Pricing Form */}
                <div>
                    <Card className="p-6">
                        <h3 className="font-semibold mb-6 flex items-center justify-between">
                            <span>Submit Proposal</span>
                        </h3>

                        {request.status === 'quoted' || request.status === 'selected' ? (
                            <div className="p-4 bg-green-50 rounded border border-green-200 text-green-800">
                                Quote submitted successfully.
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Room Cost (₹)</Label>
                                            <Input
                                                type="number"
                                                value={pricing.roomCost}
                                                onFocus={handleInputFocus}
                                                onChange={(e) => handlePriceChange('roomCost', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Food & Beverage (₹)</Label>
                                            <Input
                                                type="number"
                                                value={pricing.foodCost}
                                                onFocus={handleInputFocus}
                                                onChange={(e) => handlePriceChange('foodCost', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Conference/Hall (₹)</Label>
                                            <Input
                                                type="number"
                                                value={pricing.conferenceCost}
                                                onFocus={handleInputFocus}
                                                onChange={(e) => handlePriceChange('conferenceCost', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Transport (₹)</Label>
                                            <Input
                                                type="number"
                                                value={pricing.transportCost}
                                                onFocus={handleInputFocus}
                                                onChange={(e) => handlePriceChange('transportCost', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Taxes & Fees (%)</Label>
                                            <Input
                                                type="number"
                                                value={taxPercent}
                                                onFocus={handleInputFocus}
                                                onChange={(e) => handlePercentageChange('tax', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Service Charges (%)</Label>
                                            <Input
                                                type="number"
                                                value={servicePercent}
                                                onFocus={handleInputFocus}
                                                onChange={(e) => handlePercentageChange('service', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Extra Charges (₹)</Label>
                                            <Input
                                                type="number"
                                                value={pricing.extraCharges}
                                                onFocus={handleInputFocus}
                                                onChange={(e) => handlePriceChange('extraCharges', e.target.value)}
                                            />
                                        </div>

                                        <div className="pt-4 border-t mt-4">
                                            <div className="space-y-2 bg-green-50 p-3 rounded border border-green-100">
                                                <Label className="text-green-800">Discount (₹)</Label>
                                                <Input
                                                    type="number"
                                                    className="bg-white border-green-200"
                                                    value={pricing.discountOffered}
                                                    onFocus={handleInputFocus}
                                                    onChange={(e) => handlePriceChange('discountOffered', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="mt-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-medium">{formatCurrency(pricing.basePrice)}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2 text-green-600">
                                        <span>Discount</span>
                                        <span>-{formatCurrency(pricing.discountOffered)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-200 mt-2">
                                        <span className="text-lg font-bold text-slate-900">Final Quote Price</span>
                                        <span className="text-2xl font-bold text-blue-600">{formatCurrency(pricing.finalBasePrice)}</span>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <Button onClick={handleSubmitQuote} className="bg-blue-600 hover:bg-blue-700 min-w-[150px]">
                                        Submit Proposal
                                    </Button>
                                </div>
                            </>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}

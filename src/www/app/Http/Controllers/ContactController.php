<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Http\Requests\StoreContactRequest;
use App\Http\Requests\UpdateContactRequest;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ContactController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $contacts = [
            'contacts' =>  Contact::where("user_id", Auth::id())->latest()->paginate(request("per_page", 10))
        ];

        return Inertia::render("Contacts/Index", $contacts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreContactRequest $request)
    {
        $data = $request->validated();

        $data['user_id'] = Auth::id();

        Contact::create($data);

        return redirect()->route("contacts.index");
    }

    public function show($contact)
    {
        $receiver_id = User::where("number", $contact)->value("id") ?? 0;
        $receiver_name = User::where("number", $contact)->value("name") ?? "No user found";

        $sender_id = Auth::id();

        $messages = Message::where(
            [
                "sender_id" => $sender_id,
                "receiver_id" => $receiver_id
            ]
        )
            ->orWhere(
                [
                    "receiver_id" => $sender_id,
                    "sender_id" => $receiver_id,
                ]
            )->get();

        $data = [
            'receiver_id' =>  $receiver_id,
            'receiver_name' =>  $receiver_name,
            'sender_id' =>  $sender_id,
            'old_messages' =>  $messages,


        ];

        return Inertia::render("Contacts/Chat", $data);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateContactRequest $request, Contact $contact)
    {
        $contact->update($request->validated());

        return redirect()->route("contacts.index");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Contact $contact)
    {
        $contact->delete();

        return redirect()->route("contacts.index");
    }
}
